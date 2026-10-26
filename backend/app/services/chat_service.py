import logging
from typing import Dict, List, Tuple
from fastapi import WebSocket

logger = logging.getLogger("oporajito.chat_service")

class ChatConnectionManager:
    def __init__(self):
        # Maps conversation_id -> list of (user_id, WebSocket)
        self.conversations: Dict[str, List[Tuple[str, WebSocket]]] = {}

    async def connect(self, conversation_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        self.conversations[conversation_id].append((user_id, websocket))
        logger.info(f"User {user_id} connected to chat conversation {conversation_id}")

    def disconnect(self, conversation_id: str, user_id: str, websocket: WebSocket):
        if conversation_id in self.conversations:
            self.conversations[conversation_id] = [
                (uid, ws) for (uid, ws) in self.conversations[conversation_id] if ws != websocket
            ]
            if not self.conversations[conversation_id]:
                del self.conversations[conversation_id]
        logger.info(f"User {user_id} disconnected from chat conversation {conversation_id}")

    async def broadcast_to_conversation(self, conversation_id: str, message_data: dict):
        """Sends message to all active WebSocket listeners in this conversation."""
        if conversation_id in self.conversations:
            for user_id, websocket in list(self.conversations[conversation_id]):
                try:
                    await websocket.send_json(message_data)
                except Exception as e:
                    logger.warning(f"Error sending message to {user_id} in {conversation_id}: {e}")

chat_manager = ChatConnectionManager()
