from django.contrib import admin
from django.urls import include, path  # 确保引入 include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('polls.urls')),  # 将 polls 应用的 URL 配置包含进来

]
