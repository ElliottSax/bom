#!/usr/bin/env python3
"""
Minimal GraphQL API server for BOM Study Tools
Uses Python with Strawberry GraphQL - no WSL2 Node.js issues!
"""

import asyncio
import asyncpg
from typing import List, Optional
from strawberry import type as strawberry_type, field
from strawberry.asgi import GraphQL
import uvicorn

# Database connection settings
DATABASE_URL = "postgresql://postgres:postgres@localhost:5435/bom_study_tools_dev"

# ============================================================================
# GraphQL Types
# ============================================================================

@strawberry_type
class Verse:
    id: str
    editionId: str
    book: str
    chapter: int
    verse: int
    text: str
    verseType: Optional[str] = None

@strawberry_type
class Edition:
    id: str
    name: str
    shortName: str
    language: str
    year: int

@strawberry_type
class BookInfo:
    book: str
    verseCount: int
    chapters: int

# ============================================================================
# Database Connection Pool
# ============================================================================

pool = None

async def get_pool():
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(DATABASE_URL)
    return pool

# ============================================================================
# GraphQL Query Resolvers
# ============================================================================

@strawberry_type
class Query:
    @field
    async def health(self) -> str:
        return "OK"

    @field
    async def verses(
        self,
        editionId: str,
        book: Optional[str] = None,
        chapter: Optional[int] = None,
        limit: int = 100
    ) -> List[Verse]:
        """Get verses from a specific edition, optionally filtered by book and chapter"""
        pool = await get_pool()

        # Build query dynamically based on filters
        conditions = ['\"editionId\" = $1']
        params = [editionId]
        param_count = 1

        if book:
            param_count += 1
            conditions.append(f'book = ${param_count}')
            params.append(book)

        if chapter is not None:
            param_count += 1
            conditions.append(f'chapter = ${param_count}')
            params.append(chapter)

        where_clause = ' AND '.join(conditions)
        param_count += 1

        query = f"""
            SELECT id, "editionId", book, chapter, verse, text, "verseType"
            FROM verses
            WHERE {where_clause}
            ORDER BY book, chapter, verse
            LIMIT ${param_count}
        """
        params.append(limit)

        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *params)

        return [
            Verse(
                id=row['id'],
                editionId=row['editionId'],
                book=row['book'],
                chapter=row['chapter'],
                verse=row['verse'],
                text=row['text'],
                verseType=row['verseType']
            )
            for row in rows
        ]

    @field
    async def editions(self) -> List[Edition]:
        """Get all scripture editions"""
        pool = await get_pool()

        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, \"shortName\", language, year
                FROM editions
                ORDER BY name
            """)

        return [
            Edition(
                id=row['id'],
                name=row['name'],
                shortName=row['shortName'],
                language=row['language'],
                year=row['year']
            )
            for row in rows
        ]

    @field
    async def books(self, editionId: str) -> List[BookInfo]:
        """Get book statistics for a specific edition"""
        pool = await get_pool()

        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT
                    book,
                    COUNT(*) as verse_count,
                    COUNT(DISTINCT chapter) as chapters
                FROM verses
                WHERE \"editionId\" = $1
                GROUP BY book
                ORDER BY MIN(id)
            """, editionId)

        return [
            BookInfo(
                book=row['book'],
                verseCount=row['verse_count'],
                chapters=row['chapters']
            )
            for row in rows
        ]

# ============================================================================
# Application Setup
# ============================================================================

schema = strawberry.Schema(query=Query)
graphql_app = GraphQL(schema)

# ============================================================================
# Startup and Shutdown
# ============================================================================

async def lifespan_startup():
    """Initialize database connection pool"""
    global pool
    print("🔄 Connecting to database...")
    pool = await asyncpg.create_pool(DATABASE_URL)

    # Test connection and count verses
    async with pool.acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM verses")
        print(f"✅ Database connected - {count} verses available")

async def lifespan_shutdown():
    """Close database connection pool"""
    global pool
    if pool:
        await pool.close()
        print("🛑 Database connection closed")

# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("BOM Study Tools - GraphQL API Server (Python)")
    print("=" * 70)
    print()

    # Initialize database
    asyncio.run(lifespan_startup())

    print()
    print("🚀 Starting server...")
    print("📍 GraphQL endpoint: http://localhost:4000/graphql")
    print("🎮 GraphQL Playground: http://localhost:4000/graphql")
    print()
    print("Sample queries:")
    print("  { health }")
    print('  { editions { id name } }')
    print('  { verses(editionId: "coc-bom-1908", book: "I Nephi", chapter: 1, limit: 5) { verse text } }')
    print()

    try:
        uvicorn.run(
            graphql_app,
            host="0.0.0.0",
            port=4000,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
    finally:
        asyncio.run(lifespan_shutdown())
