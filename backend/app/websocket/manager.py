from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket connection manager for real-time updates."""

    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Store connections by execution_id for streaming
        self.execution_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a new websocket client."""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected for user: {user_id}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect a websocket client."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

        # Remove from execution tracking
        for execution_id in list(self.execution_connections.keys()):
            self.execution_connections[execution_id].discard(websocket)
            if not self.execution_connections[execution_id]:
                del self.execution_connections[execution_id]

        logger.info(f"WebSocket disconnected for user: {user_id}")

    def subscribe_to_execution(self, websocket: WebSocket, execution_id: str):
        """Subscribe a websocket to specific execution updates."""
        if execution_id not in self.execution_connections:
            self.execution_connections[execution_id] = set()
        self.execution_connections[execution_id].add(websocket)
        logger.info(f"WebSocket subscribed to execution: {execution_id}")

    async def send_to_user(self, user_id: str, message: dict):
        """Send a message to all connections for a specific user."""
        if user_id not in self.active_connections:
            return

        disconnected = set()
        for connection in self.active_connections[user_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to websocket: {e}")
                disconnected.add(connection)

        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection, user_id)

    async def send_to_execution(self, execution_id: str, message: dict):
        """Send a message to all subscribers of an execution."""
        if execution_id not in self.execution_connections:
            return

        disconnected = set()
        for connection in self.execution_connections[execution_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to websocket: {e}")
                disconnected.add(connection)

        # Remove disconnected connections
        for connection in disconnected:
            # Find which user this connection belongs to
            for user_id, connections in self.active_connections.items():
                if connection in connections:
                    self.disconnect(connection, user_id)
                    break

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients."""
        for user_id in list(self.active_connections.keys()):
            await self.send_to_user(user_id, message)

    def get_connection_count(self) -> int:
        """Get total number of active connections."""
        return sum(len(conns) for conns in self.active_connections.values())


# Global connection manager instance
manager = ConnectionManager()
