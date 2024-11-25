from django.urls import path  # 导入 Django 的路径函数，用于定义 URL 路由

from .views import home_view  # 从当前应用的 views.py 文件中导入 home_view 视图
from .views import login_view  # 从当前应用的 views.py 文件中导入 login_view 视图
from .views import MqttServerList
from .views import add_device,delete_device,get_device_list,add_condition_script,add_timer_script,get_condition_scripts,delete_condition_script,delete_timer_script,get_timer_scripts
from .views import set_device_value
urlpatterns = [  # 定义 URL 路由列表
    path('login/', login_view, name='login'),  # 将 '/login/' URL 路由指向 login_view 视图，并给该路由命名为 'login'
    path('', home_view, name='home'),  # 将根 URL ('/') 路由指向 home_view 视图，并给该路由命名为 'home'
    path('add-device/', add_device, name='add_device'),
    path('delete_device/<int:device_id>/', delete_device, name='delete_device'),
    path('get_device_list/', get_device_list, name='get_device_list'),
    path('mqtt-servers/', MqttServerList.as_view(), name='mqtt-server-list'),
    path('set_device_value/', set_device_value, name='set_device_value'),
    path('add_condition_script/', add_condition_script, name='add_condition_script'),

    # 添加定时器脚本的 URL 路由
    path('add_timer_script/',add_timer_script, name='add_timer_script'),

    path('get_condition_scripts/', get_condition_scripts, name='get_condition_scripts'),
    path('get_timer_scripts/', get_timer_scripts, name='get_timer_scripts'),

    path('delete_timer_script/<int:device_id>/', delete_timer_script, name='delete_timer_script'),
    path('delete_condition_script/<str:device_id>/', delete_condition_script, name='delete_condition_script'),

    # 其他路由
]
