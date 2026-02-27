from typing import AsyncGenerator
from ..core.database import async_session_maker


async def get_session() -> AsyncGenerator:
    """Get database session."""
    async with async_session_maker() as session:
        yield session
