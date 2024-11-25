# admin.py
from django.contrib import admin
from .models import Device, DeviceVariable

# 注册模型
admin.site.register(Device)
admin.site.register(DeviceVariable)
