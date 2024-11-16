'''
Author: cola yogurt zdx2725425693@gmail.com
Date: 2024-11-14 01:10:07
LastEditors: cola yogurt zdx2725425693@gmail.com
LastEditTime: 2024-11-14 07:14:03
FilePath: \ljk@task\ljktask\polls\consumers.py
Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
'''
# chat/consumers.py

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # 将WebSocket连接加入到聊天室组
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # 将WebSocket连接从聊天室组中移除
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        # 收到消息时将消息发送给聊天室组内的所有客户端
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': text_data
            }
        )

    def chat_message(self, event):
        # 将接收到的消息发送给WebSocket客户端
        self.send(text_data=event['message'])
