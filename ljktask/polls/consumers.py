from channels.generic.websocket import AsyncWebsocketConsumer
import json


class DeviceDataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 连接时加入房间
        self.room_name = "device_data_room"
        self.room_group_name = f"device_data_{self.room_name}"

        # 加入组
        print(f"Connecting to room: {self.room_group_name}")
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        # 接受连接
        await self.accept()
        print("WebSocket connection accepted")

    async def disconnect(self, close_code):
        # 断开连接时退出房间
        print(f"Disconnecting from room: {self.room_group_name}")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        # 接收到 WebSocket 数据时
        data = json.loads(text_data)
        print(f"Received data from WebSocket: {data}")
        await self.send(text_data=json.dumps(data))


    # 在 WebSocket 消费者中直接推送消息
    async def send_data_to_frontend(self, event):
        try:
            # 这是一个通过 channel_layer 发送给 WebSocket 的函数
            message_data = event['message']
            print(f"Received data from channel layer: {message_data}")

            # 发送数据到 WebSocket 前端
            await self.send(text_data=json.dumps({
                'message': message_data
            }))
        except Exception as e:
            print(f"Error in send_data_to_frontend: {e}")

