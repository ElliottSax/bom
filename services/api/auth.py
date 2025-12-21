#!/usr/bin/env python3
"""
Authentication module for BOM Study Tools API
Provides JWT-based authentication
"""

import jwt
import hashlib
import secrets
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"  # Should be environment variable
ALGORITHM = "HS256"
TOKEN_EXPIRATION_HOURS = 24

def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    salt = "bom-study-tools"  # In production, use unique salt per user
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == hashed

def create_token(user_id: str, email: str) -> str:
    """Create a JWT token for a user"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRATION_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def extract_token_from_header(auth_header: str) -> Optional[str]:
    """Extract token from Authorization header"""
    if not auth_header:
        return None

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    return parts[1]

def handle_auth_mutations(query_str: str, headers: Dict[str, str], db_connection):
    """Handle authentication-related mutations"""

    # Register mutation
    if 'register(' in query_str.lower():
        import re

        # Parse parameters
        email_match = re.search(r'email:\s*"([^"]+)"', query_str)
        password_match = re.search(r'password:\s*"([^"]+)"', query_str)
        name_match = re.search(r'displayName:\s*"([^"]+)"', query_str)

        if not email_match or not password_match:
            return {'errors': [{'message': 'Email and password are required'}]}

        email = email_match.group(1)
        password = password_match.group(1)
        display_name = name_match.group(1) if name_match else email.split('@')[0]

        conn = db_connection()
        cur = conn.cursor()

        try:
            # Check if user exists
            cur.execute('SELECT id FROM users WHERE email = %s', (email,))
            if cur.fetchone():
                conn.close()
                return {'errors': [{'message': 'User already exists'}]}

            # Create user
            user_id = f"user_{secrets.token_hex(4)}"
            hashed_password = hash_password(password)

            cur.execute('''
                INSERT INTO users (id, email, password, "displayName", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, email, "displayName"
            ''', (user_id, email, hashed_password, display_name))

            user = cur.fetchone()
            conn.commit()

            # Create token
            token = create_token(user_id, email)

            cur.close()
            conn.close()

            return {'data': {'register': {
                'user': user,
                'token': token
            }}}

        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return {'errors': [{'message': str(e)}]}

    # Login mutation
    if 'login(' in query_str.lower():
        import re

        # Parse parameters
        email_match = re.search(r'email:\s*"([^"]+)"', query_str)
        password_match = re.search(r'password:\s*"([^"]+)"', query_str)

        if not email_match or not password_match:
            return {'errors': [{'message': 'Email and password are required'}]}

        email = email_match.group(1)
        password = password_match.group(1)

        conn = db_connection()
        cur = conn.cursor()

        try:
            # Find user
            cur.execute('''
                SELECT id, email, password, "displayName"
                FROM users WHERE email = %s
            ''', (email,))

            user = cur.fetchone()

            if not user or not verify_password(password, user['password']):
                cur.close()
                conn.close()
                return {'errors': [{'message': 'Invalid email or password'}]}

            # Create token
            token = create_token(user['id'], user['email'])

            # Remove password from response
            del user['password']

            cur.close()
            conn.close()

            return {'data': {'login': {
                'user': user,
                'token': token
            }}}

        except Exception as e:
            cur.close()
            conn.close()
            return {'errors': [{'message': str(e)}]}

    # Current user query
    if 'currentUser' in query_str.lower():
        auth_header = headers.get('Authorization', '')
        token = extract_token_from_header(auth_header)

        if not token:
            return {'data': {'currentUser': None}}

        payload = verify_token(token)
        if not payload:
            return {'data': {'currentUser': None}}

        conn = db_connection()
        cur = conn.cursor()

        try:
            cur.execute('''
                SELECT id, email, "displayName", "avatarUrl", "createdAt"
                FROM users WHERE id = %s
            ''', (payload['user_id'],))

            user = cur.fetchone()

            if user and user.get('createdAt'):
                user['createdAt'] = user['createdAt'].isoformat()

            cur.close()
            conn.close()

            return {'data': {'currentUser': user}}

        except Exception as e:
            cur.close()
            conn.close()
            return {'errors': [{'message': str(e)}]}

    # Update profile mutation
    if 'updateProfile(' in query_str.lower():
        auth_header = headers.get('Authorization', '')
        token = extract_token_from_header(auth_header)

        if not token:
            return {'errors': [{'message': 'Authentication required'}]}

        payload = verify_token(token)
        if not payload:
            return {'errors': [{'message': 'Invalid or expired token'}]}

        import re

        # Parse parameters
        name_match = re.search(r'displayName:\s*"([^"]+)"', query_str)
        avatar_match = re.search(r'avatarUrl:\s*"([^"]+)"', query_str)

        conn = db_connection()
        cur = conn.cursor()

        try:
            updates = []
            params = []

            if name_match:
                updates.append('"displayName" = %s')
                params.append(name_match.group(1))

            if avatar_match:
                updates.append('"avatarUrl" = %s')
                params.append(avatar_match.group(1))

            if updates:
                updates.append('"updatedAt" = CURRENT_TIMESTAMP')
                params.append(payload['user_id'])

                sql = f'''
                    UPDATE users
                    SET {', '.join(updates)}
                    WHERE id = %s
                    RETURNING id, email, "displayName", "avatarUrl"
                '''

                cur.execute(sql, params)
                user = cur.fetchone()
                conn.commit()
            else:
                cur.execute('''
                    SELECT id, email, "displayName", "avatarUrl"
                    FROM users WHERE id = %s
                ''', (payload['user_id'],))
                user = cur.fetchone()

            cur.close()
            conn.close()

            return {'data': {'updateProfile': user}}

        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return {'errors': [{'message': str(e)}]}

    return None

def get_current_user_id(headers: Dict[str, str]) -> Optional[str]:
    """Get the current user ID from request headers"""
    auth_header = headers.get('Authorization', '')
    token = extract_token_from_header(auth_header)

    if not token:
        return None

    payload = verify_token(token)
    if not payload:
        return None

    return payload.get('user_id')

# GraphQL schema additions
AUTH_SCHEMA = '''
type User {
  id: String!
  email: String!
  displayName: String
  avatarUrl: String
  createdAt: String
}

type AuthPayload {
  user: User!
  token: String!
}

extend type Query {
  currentUser: User
}

extend type Mutation {
  register(email: String!, password: String!, displayName: String): AuthPayload
  login(email: String!, password: String!): AuthPayload
  updateProfile(displayName: String, avatarUrl: String): User
  changePassword(oldPassword: String!, newPassword: String!): User
}
'''