#!/usr/bin/env python3
"""
Minimal Cost-Optimized Server for BOM Study Tools
No Redis, No Qdrant, No OpenAI - Just core scripture GraphQL API
Designed for free tier deployments (Render, Fly.io, Railway)
"""

import os
import sys
from datetime import datetime
from flask import Flask, jsonify, request
from flask_graphql import GraphQLView
from flask_cors import CORS
import graphene
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from graphene_sqlalchemy import SQLAlchemyObjectType

# Configuration
DATABASE_URL = os.getenv('DATABASE_URL', '')
# Render/Railway use postgres://, SQLAlchemy needs postgresql://
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

PORT = int(os.getenv('PORT', 4000))
DEBUG = os.getenv('NODE_ENV', 'development') != 'production'

# Validate database URL
if not DATABASE_URL or DATABASE_URL == 'postgresql://':
    print("ERROR: DATABASE_URL environment variable not set!")
    print("Please set DATABASE_URL to your PostgreSQL connection string")
    sys.exit(1)

# SQLAlchemy setup
Base = declarative_base()
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=DEBUG
)
db_session = scoped_session(sessionmaker(bind=engine))

# ============================================================================
# Database Models
# ============================================================================

class VerseModel(Base):
    """Scripture verse model"""
    __tablename__ = 'verses'

    id = Column(String, primary_key=True)
    editionId = Column('editionId', String, nullable=False, index=True)
    book = Column(String, nullable=False, index=True)
    chapter = Column(Integer, nullable=False, index=True)
    verse = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    verseType = Column('verseType', String, default='standard')
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EditionModel(Base):
    """Scripture edition model"""
    __tablename__ = 'editions'

    id = Column(String, primary_key=True)
    workId = Column('workId', String)
    name = Column(String, nullable=False)
    shortName = Column('shortName', String)
    publisher = Column(String)
    year = Column(Integer)
    language = Column(String, default='en')
    description = Column(Text)
    isDefault = Column('isDefault', Boolean, default=False)
    isPrimary = Column('isPrimary', Boolean, default=False)
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WorkModel(Base):
    """Scripture work model (Book of Mormon, D&C, Bible)"""
    __tablename__ = 'works'

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    abbreviation = Column(String)
    description = Column(Text)
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ============================================================================
# GraphQL Types
# ============================================================================

class Verse(SQLAlchemyObjectType):
    """GraphQL Verse type"""
    class Meta:
        model = VerseModel
        exclude_fields = ('createdAt', 'updatedAt')

class Edition(SQLAlchemyObjectType):
    """GraphQL Edition type"""
    class Meta:
        model = EditionModel
        exclude_fields = ('createdAt', 'updatedAt')

class Work(SQLAlchemyObjectType):
    """GraphQL Work type"""
    class Meta:
        model = WorkModel
        exclude_fields = ('createdAt', 'updatedAt')

class Book(graphene.ObjectType):
    """Book metadata"""
    name = graphene.String()
    chapter_count = graphene.Int()
    verse_count = graphene.Int()

class Statistics(graphene.ObjectType):
    """Database statistics"""
    total_verses = graphene.Int()
    total_editions = graphene.Int()
    total_works = graphene.Int()
    total_books = graphene.Int()

# ============================================================================
# GraphQL Queries
# ============================================================================

class Query(graphene.ObjectType):
    # Verses
    verses = graphene.List(
        Verse,
        edition_id=graphene.String(),
        book=graphene.String(),
        chapter=graphene.Int(),
        verse_start=graphene.Int(),
        verse_end=graphene.Int(),
        limit=graphene.Int(),
        description="Get scripture verses with optional filters"
    )

    verse = graphene.Field(
        Verse,
        id=graphene.String(required=True),
        description="Get a single verse by ID"
    )

    # Editions
    editions = graphene.List(
        Edition,
        description="Get all scripture editions"
    )

    edition = graphene.Field(
        Edition,
        id=graphene.String(required=True),
        description="Get a single edition by ID"
    )

    # Works
    works = graphene.List(
        Work,
        description="Get all scripture works (BoM, D&C, Bible)"
    )

    # Books
    books = graphene.List(
        Book,
        edition_id=graphene.String(),
        description="Get list of books with metadata"
    )

    # Search
    search_verses = graphene.List(
        Verse,
        query=graphene.String(required=True),
        edition_id=graphene.String(),
        limit=graphene.Int(),
        description="Search verses by text content"
    )

    # Statistics
    statistics = graphene.Field(
        Statistics,
        description="Get database statistics"
    )

    # ========================================================================
    # Resolvers
    # ========================================================================

    def resolve_verses(self, info, edition_id=None, book=None, chapter=None,
                      verse_start=None, verse_end=None, limit=100):
        """Fetch verses with filters"""
        query = db_session.query(VerseModel)

        if edition_id:
            query = query.filter(VerseModel.editionId == edition_id)
        if book:
            query = query.filter(VerseModel.book == book)
        if chapter:
            query = query.filter(VerseModel.chapter == chapter)
        if verse_start:
            query = query.filter(VerseModel.verse >= verse_start)
        if verse_end:
            query = query.filter(VerseModel.verse <= verse_end)

        query = query.order_by(VerseModel.chapter, VerseModel.verse)
        return query.limit(min(limit, 1000)).all()

    def resolve_verse(self, info, id):
        """Fetch single verse by ID"""
        return db_session.query(VerseModel).filter(VerseModel.id == id).first()

    def resolve_editions(self, info):
        """Fetch all editions"""
        return db_session.query(EditionModel).order_by(EditionModel.displayOrder).all()

    def resolve_edition(self, info, id):
        """Fetch single edition by ID"""
        return db_session.query(EditionModel).filter(EditionModel.id == id).first()

    def resolve_works(self, info):
        """Fetch all works"""
        return db_session.query(WorkModel).all()

    def resolve_books(self, info, edition_id=None):
        """Fetch books with metadata"""
        query = db_session.query(
            VerseModel.book,
            func.max(VerseModel.chapter).label('chapter_count'),
            func.count(VerseModel.id).label('verse_count')
        )

        if edition_id:
            query = query.filter(VerseModel.editionId == edition_id)

        query = query.group_by(VerseModel.book)
        results = query.all()

        return [
            Book(
                name=row.book,
                chapter_count=row.chapter_count,
                verse_count=row.verse_count
            )
            for row in results
        ]

    def resolve_search_verses(self, info, query, edition_id=None, limit=50):
        """Search verses by text content"""
        search_query = db_session.query(VerseModel).filter(
            VerseModel.text.ilike(f'%{query}%')
        )

        if edition_id:
            search_query = search_query.filter(VerseModel.editionId == edition_id)

        return search_query.limit(min(limit, 100)).all()

    def resolve_statistics(self, info):
        """Get database statistics"""
        total_verses = db_session.query(func.count(VerseModel.id)).scalar()
        total_editions = db_session.query(func.count(EditionModel.id)).scalar()
        total_works = db_session.query(func.count(WorkModel.id)).scalar()
        total_books = db_session.query(func.count(func.distinct(VerseModel.book))).scalar()

        return Statistics(
            total_verses=total_verses or 0,
            total_editions=total_editions or 0,
            total_works=total_works or 0,
            total_books=total_books or 0
        )

# Create GraphQL schema
schema = graphene.Schema(query=Query)

# ============================================================================
# Flask Application
# ============================================================================

app = Flask(__name__)

# CORS configuration
cors_origins = os.getenv('CORS_ORIGIN', '*')
CORS(app, resources={r"/*": {"origins": cors_origins.split(',')}})

# GraphQL endpoint
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True,  # Enable GraphiQL interface in browser
        get_context=lambda: {'session': db_session}
    )
)

# ============================================================================
# Health & Info Endpoints
# ============================================================================

@app.route('/health')
def health():
    """Health check endpoint"""
    try:
        # Test database connection
        db_session.execute('SELECT 1')
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'

    return jsonify({
        'status': 'healthy' if db_status == 'connected' else 'unhealthy',
        'version': '1.0.0',
        'database': db_status,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/')
def root():
    """API information"""
    return jsonify({
        'name': 'BOM Study Tools API - Cost Optimized',
        'version': '1.0.0',
        'description': 'Community of Christ Scripture Study API',
        'endpoints': {
            'graphql': '/graphql',
            'graphiql': '/graphql (visit in browser)',
            'health': '/health',
            'info': '/'
        },
        'features': {
            'scripture_editions': 'Book of Mormon, Doctrine & Covenants',
            'search': 'Full-text verse search',
            'cost_optimized': 'No AI, Redis, or Qdrant dependencies'
        }
    })

@app.teardown_appcontext
def shutdown_session(exception=None):
    """Clean up database session"""
    db_session.remove()

# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("BOM Study Tools API - Cost-Optimized Server")
    print("=" * 60)
    print(f"Environment: {os.getenv('NODE_ENV', 'development')}")
    print(f"Port: {PORT}")
    print(f"Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'configured'}")
    print(f"GraphQL: http://0.0.0.0:{PORT}/graphql")
    print("=" * 60)

    # Run server
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=DEBUG
    )
