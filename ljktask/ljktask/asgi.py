
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from polls import routing  # 导入路由配置

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'polls.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            routing.websocket_urlpatterns  # 配置 WebSocket 路由
        )
    ),
})
