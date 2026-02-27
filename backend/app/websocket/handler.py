from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import json
import logging

from ..core.security import decode_access_token
from ..core.database import get_db
from .manager import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])


@router.websocket("/executions")
async def execution_websocket(
    websocket: WebSocket,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """WebSocket endpoint for real-time execution updates."""
    try:
        # Verify token
        payload = decode_access_token(token)
        user_id = payload.get("sub")

        if not user_id:
            await websocket.close(code=1008, reason="Invalid token")
            return

        # Connect websocket
        await manager.connect(websocket, user_id)

        # Handle incoming messages
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)

                # Handle subscription to specific execution
                if message.get("type") == "subscribe_execution":
                    execution_id = message.get("execution_id")
                    if execution_id:
                        manager.subscribe_to_execution(websocket, execution_id)
                        await websocket.send_json({
                            "type": "subscribed",
                            "execution_id": execution_id
                        })

            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON received: {data}")

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        logger.info(f"WebSocket disconnected for user: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)
