# your_app_name/routing.py

from django.urls import path
from . import consumers  # 导入消费者

# WebSocket 路由配置
websocket_urlpatterns = [
    path('ws/device_data/', consumers.DeviceDataConsumer.as_asgi()),  # 配置 WebSocket 路由
]
