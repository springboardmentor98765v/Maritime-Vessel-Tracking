import json
from channels.generic.websocket import AsyncWebsocketConsumer

class VesselConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "vessel_updates"

        # Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        # We don't necessarily need to receive data from client for streaming
        pass

    # Receive message from group
    async def vessel_update(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))
