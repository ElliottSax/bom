# 💰 Cost-Optimized Deployment Guide

**Goal**: Deploy BOM Study Tools API with $0/month cost (or <$5/month)

---

## 🎯 **RECOMMENDED: Render.com Free Tier**

**Total Cost**: **$0/month** (with limitations)

### **What You Get Free**:

- ✅ Web Service (API server)
- ✅ PostgreSQL database (500MB, 90-day free trial then $7/month)
- ✅ Auto SSL certificate
- ✅ Auto deploys from GitHub
- ⚠️ Spins down after 15 min inactivity (first request takes ~30 seconds to wake)

---

## 📋 **Cost-Cutting Strategy**

### **Disable Expensive Features** (Save ~$20-50/month)

**Services to SKIP initially**:

- ❌ Redis (not critical, saves $5-10/month)
- ❌ Qdrant vector database (not critical, saves $10-20/month)
- ❌ OpenAI API (can enable later, saves $10-30/month)
- ❌ Sentry crash reporting (use free tier or skip, saves $0-26/month)
- ❌ Email service (skip for now, saves $5-15/month)

**What you NEED**:

- ✅ API server (Node.js/Python)
- ✅ PostgreSQL database
- ✅ Scripture data

**Estimated Cost**: **$0-7/month**

---

## 🚀 **Option 1: Render.com (RECOMMENDED)**

### **Cost Breakdown**:

| Service     | Free Tier            | Paid                 | Recommended    |
| ----------- | -------------------- | -------------------- | -------------- |
| Web Service | ✅ Free (spins down) | $7/month (always on) | Free           |
| PostgreSQL  | ✅ 90 days free      | $7/month after       | Free then $7   |
| **TOTAL**   | **$0/month**         | **$14/month**        | **$0-7/month** |

### **Deployment Steps**:

#### **1. Prepare the Code** (5 min)

```bash
cd /mnt/e/projects/bom

# Create minimal .env for production
cat > services/api/.env.render << 'EOF'
NODE_ENV=production
PORT=4000

# Database will be auto-injected by Render
# DATABASE_URL will be provided by Render

# Disable expensive features
ENABLE_AI_CHAT=false
ENABLE_SEMANTIC_SEARCH=false
REDIS_URL=
QDRANT_URL=

# Basic security
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# CORS - update after you know your domain
CORS_ORIGIN=*

# Minimal logging
LOG_LEVEL=warn
EOF
```

#### **2. Create Render-Optimized Server** (10 min)

Create a minimal server without Redis/Qdrant dependencies:

```bash
# Create minimal production server
cat > services/api/server-render.py << 'EOF'
#!/usr/bin/env python3
"""
Minimal Production Server for Render.com
No Redis, No Qdrant, No AI - Just core scripture API
"""

import os
from flask import Flask, jsonify
from flask_graphql import GraphQLView
from flask_cors import CORS
import graphene
from graphene_sqlalchemy import SQLAlchemyObjectType
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

# Configuration
DATABASE_URL = os.getenv('DATABASE_URL', '').replace('postgres://', 'postgresql://')
PORT = int(os.getenv('PORT', 4000))

# SQLAlchemy setup
Base = declarative_base()
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
db_session = scoped_session(sessionmaker(bind=engine))

# Models
class VerseModel(Base):
    __tablename__ = 'verses'
    id = Column(String, primary_key=True)
    editionId = Column('editionId', String)
    book = Column(String)
    chapter = Column(Integer)
    verse = Column(Integer)
    text = Column(Text)
    verseType = Column('verseType', String, default='standard')

class EditionModel(Base):
    __tablename__ = 'editions'
    id = Column(String, primary_key=True)
    name = Column(String)
    shortName = Column('shortName', String)
    language = Column(String)
    year = Column(Integer)

# GraphQL Types
class Verse(SQLAlchemyObjectType):
    class Meta:
        model = VerseModel

class Edition(SQLAlchemyObjectType):
    class Meta:
        model = EditionModel

# GraphQL Queries
class Query(graphene.ObjectType):
    verses = graphene.List(
        Verse,
        editionId=graphene.String(),
        book=graphene.String(),
        chapter=graphene.Int(),
        limit=graphene.Int()
    )
    editions = graphene.List(Edition)

    def resolve_verses(self, info, editionId=None, book=None, chapter=None, limit=100):
        query = db_session.query(VerseModel)
        if editionId:
            query = query.filter(VerseModel.editionId == editionId)
        if book:
            query = query.filter(VerseModel.book == book)
        if chapter:
            query = query.filter(VerseModel.chapter == chapter)
        return query.limit(limit).all()

    def resolve_editions(self, info):
        return db_session.query(EditionModel).all()

# Create schema
schema = graphene.Schema(query=Query)

# Flask app
app = Flask(__name__)
CORS(app)

# GraphQL endpoint
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
)

# Health check
@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'version': '1.0.0'})

@app.route('/')
def root():
    return jsonify({
        'name': 'BOM Study Tools API',
        'version': '1.0.0',
        'graphql': '/graphql',
        'health': '/health'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
EOF

chmod +x services/api/server-render.py
```

#### **3. Create Minimal Requirements** (2 min)

```bash
cat > services/api/requirements-minimal.txt << 'EOF'
Flask==3.0.0
flask-graphql==2.0.1
flask-cors==4.0.0
graphene==3.3
graphene-sqlalchemy==3.0.0
SQLAlchemy==2.0.23
psycopg2-binary==2.9.9
python-dotenv==1.0.0
EOF
```

#### **4. Deploy to Render** (10 min)

**Via Render Dashboard** (easier):

1. Go to https://render.com
2. Sign up (free)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository (fork if needed)
5. Configure:
   - **Name**: `bom-study-tools-api`
   - **Region**: Choose closest to your users
   - **Branch**: `master` or `main`
   - **Root Directory**: `services/api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements-minimal.txt`
   - **Start Command**: `python3 server-render.py`
   - **Plan**: **Free**

6. Add PostgreSQL:
   - Click "New +" → "PostgreSQL"
   - **Name**: `bom-postgres`
   - **Plan**: **Free**
   - Note the connection string

7. Link database to web service:
   - Go back to your web service
   - Environment → Add `DATABASE_URL` → Select your PostgreSQL database

8. Deploy!

---

## 🚀 **Option 2: Fly.io (Stay Free Forever)**

### **Cost Breakdown**:

| Resource               | Free Allowance    | Usage                      | Cost         |
| ---------------------- | ----------------- | -------------------------- | ------------ |
| 3 shared VMs           | 2,340 hours/month | 1 API + 1 DB = 1,440 hours | $0           |
| 3GB persistent storage |                   | PostgreSQL ~1GB            | $0           |
| 160GB outbound data    |                   | Typical: <10GB             | $0           |
| **TOTAL**              |                   |                            | **$0/month** |

### **Deployment Steps**:

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

cd /mnt/e/projects/bom

# Login
flyctl auth login

# Create app
flyctl apps create bom-study-tools-api

# Create PostgreSQL
flyctl postgres create --name bom-postgres --vm-size shared-cpu-1x --volume-size 1

# Get connection string
flyctl postgres attach --app bom-study-tools-api bom-postgres

# Create fly.toml
cat > fly.toml << 'EOF'
app = "bom-study-tools-api"
primary_region = "ord"

[build]
  [build.args]
    NODE_VERSION = "20"

[env]
  PORT = "8080"
  NODE_ENV = "production"
  ENABLE_AI_CHAT = "false"
  ENABLE_SEMANTIC_SEARCH = "false"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
EOF

# Deploy
flyctl deploy
```

**Fly.io Auto-Scaling**: Scales to 0 when idle (saves money), auto-starts on request

---

## 🚀 **Option 3: Supabase (Free PostgreSQL) + Vercel/Railway (Free API)**

### **Cost**: **$0/month**

**Strategy**: Use Supabase's free PostgreSQL, host API elsewhere

1. **Create Supabase Database** (https://supabase.com)
   - Free: 500MB database, unlimited API requests
   - Get connection string

2. **Deploy API to Vercel** (https://vercel.com)
   - Free: Serverless functions
   - Connect to Supabase PostgreSQL

---

## 📊 **Cost Comparison**

| Platform              | Year 1    | Year 2+              | Pros                  | Cons                   |
| --------------------- | --------- | -------------------- | --------------------- | ---------------------- |
| **Render Free**       | $0        | $84 (after DB trial) | Easy, no credit card  | Spins down, DB expires |
| **Fly.io**            | $0        | $0                   | Stays free, always on | Slightly complex setup |
| **Railway**           | $5 credit | $60/year             | Easy, reliable        | Costs money faster     |
| **Supabase + Vercel** | $0        | $0                   | Free forever          | More setup needed      |

**RECOMMENDATION**: **Fly.io** (free forever) or **Render** (free to start)

---

## 🎯 **Immediate Cost-Saving Actions**

### **1. Create Minimal Server Configuration**

```bash
cd /mnt/e/projects/bom

# Disable expensive features in .env
cat > services/api/.env.production.minimal << 'EOF'
# Core settings only
NODE_ENV=production
PORT=4000

# Disable AI (saves $10-30/month)
ENABLE_AI_CHAT=false
OPENAI_API_KEY=

# Disable vector search (saves $10-20/month)
ENABLE_SEMANTIC_SEARCH=false
QDRANT_URL=

# Skip Redis caching (saves $5-10/month)
REDIS_URL=
CACHE_ENABLED=false

# Skip email (saves $5-15/month)
EMAIL_PROVIDER=none

# Minimal logging
LOG_LEVEL=error

# Basic security (generate new secrets!)
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=*
EOF
```

### **2. Use Minimal Dependencies**

Only install what's needed:

- PostgreSQL (free tier: Render/Fly/Supabase)
- GraphQL server
- Basic auth

Skip:

- Redis
- Qdrant
- OpenAI
- Email services
- Analytics
- Monitoring (use free tiers later)

### **3. Optimize Database**

```sql
-- Keep only essential data initially
-- Start with Book of Mormon only (8,701 verses)
-- Add D&C later (3,084 verses)
-- Total: ~12,000 verses = ~5MB

-- Skip indexes for now (saves space)
-- Add only when performance needed
```

---

## 🎯 **Next Steps - Deploy Now**

### **Choose Your Path**:

**Path A: Render.com** (Easiest, Free for 90 days)

```bash
# Push code to GitHub
git add .
git commit -m "feat: Add cost-optimized deployment config"
git push

# Then follow Render dashboard steps above
```

**Path B: Fly.io** (Free Forever)

```bash
# Install and deploy
curl -L https://fly.io/install.sh | sh
flyctl auth login
flyctl launch
```

---

## 💡 **Future Cost Management**

### **When Free Tier Expires** (after 90 days on Render):

**Option 1**: Pay $7/month for PostgreSQL on Render (total: $7/month)

**Option 2**: Migrate to Fly.io (total: $0/month)

```bash
# Export data from Render
pg_dump $RENDER_DATABASE_URL > backup.sql

# Import to Fly.io
flyctl postgres connect -a bom-postgres < backup.sql
```

**Option 3**: Use Supabase free PostgreSQL (total: $0/month)

- 500MB storage (enough for scripture data)
- Unlimited API requests
- Free forever

---

## 📝 **Which Platform Should You Use?**

**Use Render if**:

- You want the easiest setup
- You're okay paying $7/month after 90 days
- You want a simple dashboard

**Use Fly.io if**:

- You want $0 cost forever
- You're comfortable with CLI tools
- You want more control

**Use Supabase + Vercel if**:

- You want free forever
- You're okay with more complex setup
- You want to learn serverless

---

**My Recommendation**: Start with **Fly.io** - it's free forever and stays within free tier for this workload.

Ready to deploy? Tell me which platform you prefer and I'll walk you through it step-by-step!
