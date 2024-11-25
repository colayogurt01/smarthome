from rest_framework import serializers
from .models import MqttServer

class MqttServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = MqttServer
        fields = ['id', 'server_address', 'port', 'username', 'password', 'client_id']
