

import uuid
import hashlib
import time
from django.db import models

class Device(models.Model):
    id = models.AutoField(primary_key=True)  # 自动生成唯一的设备 ID
    device_name = models.CharField(max_length=100)  # 设备名称
    device_topic = models.CharField(max_length=100)  # 设备订阅的主题
    client_id = models.CharField(max_length=255, unique=True, blank=True, null=True)  # 用来存储生成的 MQTT clientId

    def __str__(self):
        return self.device_name

    def generate_mqtt_client_id(self):
        """
        生成一个唯一且复杂的 MQTT clientId。
        :return: 生成的 clientId 字符串
        """
        # 使用设备的 ID、设备名称、时间戳和 UUID 生成 clientId
        timestamp = int(time.time())  # 当前时间戳
        unique_id = uuid.uuid4()  # 随机 UUID
        raw_string = f"{self.id}-{self.device_name}-{timestamp}-{unique_id}"
        # 使用 SHA-256 生成哈希值，截取前 16 位
        hashed_id = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()[:16]
        return f"device-{hashed_id}"

    def save(self, *args, **kwargs):
        """
        在保存设备之前，自动生成并保存 clientId（如果没有设置的话）
        """
        if not self.client_id:  # 如果没有 client_id，则生成一个新的
            self.client_id = self.generate_mqtt_client_id()
        super(Device, self).save(*args, **kwargs)


class DeviceVariable(models.Model):
    device = models.ForeignKey(Device, related_name='variables', on_delete=models.CASCADE)  # 外键关联设备
    value_name = models.CharField(max_length=100)  # 数据变量名称
    value_type = models.CharField(max_length=20, choices=[('int', 'Integer'), ('float', 'Float'), ('bool', 'Boolean')])  # 数据变量类型
    data_direction = models.CharField(max_length=10, choices=[('receive', 'Receive'), ('send', 'Send'), ('both', 'Both')], default='both')

    def __str__(self):
        return f"{self.value_name} ({self.value_type})"



class MqttServer(models.Model):
    server_address = models.CharField(max_length=255)
    port = models.IntegerField(default=1883)
    username = models.CharField(max_length=255, blank=True, null=True)
    password = models.CharField(max_length=255, blank=True, null=True)
    client_id = models.CharField(max_length=255, blank=True, null=True)
    # 最后修改时间
    last_modified = models.DateTimeField(auto_now=True)
    # 连接状态
    is_connected = models.BooleanField(default=False)

    def __str__(self):
        return f"MQTT Server at {self.server_address}:{self.port}"

    # 可以添加方法来检查服务器是否在线等
    def check_connection(self):
        # 在此方法中可以添加连接服务器的逻辑
        # 例如尝试连接服务器并返回连接状态
        pass

    @staticmethod
    def get_or_create_default_config(data=None):
        """保证最多只有一条 MQTT 配置"""
        # 如果没有配置则创建新的配置，如果已经有配置则更新现有配置
        mqtt_server, created = MqttServer.objects.get_or_create(id=1)  # 假设使用 id=1 的唯一记录
        if data:
            # 如果传入了数据，更新现有的配置
            mqtt_server.server_address = data.get('server_address', mqtt_server.server_address)
            mqtt_server.port = data.get('port', mqtt_server.port)
            mqtt_server.username = data.get('username', mqtt_server.username)
            mqtt_server.password = data.get('password', mqtt_server.password)
            mqtt_server.client_id = data.get('client_id', mqtt_server.client_id)
            mqtt_server.save()
        return mqtt_server

    def __str__(self):
        return self.server_address