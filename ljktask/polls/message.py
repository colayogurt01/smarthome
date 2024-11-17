import paho.mqtt.client as mqtt
from .models import MqttServer, Device,DeviceVariable
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json
import logging


# 获取 MQTT 配置信息
def get_mqtt_config():
    # 获取数据库中最新的 MQTT 服务器配置
    mqtt_server = MqttServer.objects.first()  # 获取第一个 MQTT 服务器配置

    if mqtt_server:
        return {
            'MQTT_BROKER': mqtt_server.server_address,
            'MQTT_PORT': mqtt_server.port,
            'MQTT_USERNAME': mqtt_server.username,
            'MQTT_PASSWORD': mqtt_server.password,
            'MQTT_CLIENT_ID': mqtt_server.client_id,
        }
    else:
        # 没有找到有效配置时使用默认配置
        print("没有找到有效的 MQTT 服务器配置，使用默认配置。")
        return {
            'MQTT_BROKER': "broker.emqx.io",
            'MQTT_PORT': 1883,
            'MQTT_CLIENT_ID': "default-client-id",
        }


# 获取设备的订阅主题（设备名/订阅主题）
def get_device_subscriptions():
    # 获取所有设备的订阅主题
    devices = Device.objects.all()  # 获取所有设备
    return [f"{device.device_name}/{device.device_topic}" for device in devices]  # 拼接设备名和订阅主题

# 连接成功后的回调函数
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")

    # 获取设备的订阅主题
    topics = get_device_subscriptions()


    # 逐个订阅设备的主题
    for topic in topics:
        print(f"Subscribing to topic: {topic}")
        client.subscribe(topic)  # 订阅每个设备的主题
        print(f"Subscribed to topic: {topic}")
    if rc == 0:
        print("连接成功")
    else:
        print(f"连接失败，返回码 {rc}")

def subscribe_device_topics(client):
    # 这里根据设备信息生成相应的 MQTT 主题
    # 假设每个设备有一个唯一的 device_id 并且主题遵循 'device/{device_id}/data'
    topics = get_device_subscriptions()
    # 逐个订阅设备的主题
    for topic in topics:
        print(f"Subscribing to topic: {topic}")
        client.subscribe(topic)
def on_disconnect(client, userdata, rc):
    if rc != 0:
        print("断开连接，返回码", rc)

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    print(f"Received message: {payload} on topic {msg.topic}")

    try:
        # 尝试将接收到的消息解析为 JSON
        message_data = json.loads(payload)

        # 打印解析后的数据
        print(f"Parsed message: {message_data}")

        if not isinstance(message_data, dict):
            print("Error: The message is not a valid JSON object.")
            return

        device_name = message_data.get("device_name")
        if not device_name:
            print("Warning: Device name is missing.")
            return

        # 从数据库中查找设备并获取数据
        device = Device.objects.get(device_name=device_name)
        device_variables = DeviceVariable.objects.filter(device=device, data_direction='receive')


        formatted_data = {"device_name": device_name}
        for variable in device_variables:
            variable_name = variable.value_name
            value = message_data.get(variable_name)
            if value is not None:
                formatted_data["value_name"] = variable_name
                formatted_data[variable_name] = value
            else:
                print(f"Warning: {variable_name} not found in the message.")
        print(formatted_data)
        channel_layer = get_channel_layer()  # 重要代码
        async_to_sync(channel_layer.group_send)("device_data_device_data_room",
                                                {"type": "send_data_to_frontend",
                                                 "message": formatted_data
                                                 }
                                                )  # 重要代码
        # print(message_data)
        print("Data sent to WebSocket consumer.")


    except json.JSONDecodeError:
        print("Failed to decode JSON message.")
    except Exception as e:
        print(f"Unexpected error: {e}")








# 调用函数
def connectMqtt():
    # 设置连接回调函数
    # 获取配置
    config = get_mqtt_config()

    # 创建 MQTT 客户端实例
    client = mqtt.Client(client_id=config['MQTT_CLIENT_ID'])
    if config['MQTT_PASSWORD']:  # 如果密码不为空
        client.username_pw_set(username=config['MQTT_USERNAME'], password=config['MQTT_PASSWORD'])
    else:
        print("密码为空，不设置用户名和密码")
    client.on_connect = on_connect
    # 设置接收到消息时的回调函数
    client.on_message = on_message

    # 连接到 MQTT 服务器
    client.connect(config['MQTT_BROKER'], config['MQTT_PORT'], 60)
    print("Connecting to MQTT broker...")
    print(config['MQTT_BROKER'])
    print(config['MQTT_PORT'])
    # 启动事件循环
    client.loop_start()  # 使用 loop_start() 来异步运行
    return client

def disconnectMqtt(client):
    """断开 MQTT 连接"""
    print("Disconnecting from MQTT broker...")
    try:
        # 停止事件循环
        client.loop_stop()  # 停止事件循环
        client.disconnect()  # 断开连接
        print("Disconnected successfully")
    except Exception as e:
        print(f"Error while disconnecting: {e}")


client=connectMqtt()