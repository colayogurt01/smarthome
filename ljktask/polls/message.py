import paho.mqtt.client as mqtt
from .models import MqttServer, Device
import json
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
            'MQTT_BROKER': "localhost",
            'MQTT_PORT': 1883,
            'MQTT_USERNAME': "MQTT1",
            'MQTT_PASSWORD': "zdx1314520",
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
        client.subscribe(topic)  # 订阅每个设备的主题
        print(f"Subscribed to topic: {topic}")




def on_message(client, userdata, msg):
    # 打印原始消息内容和主题
    print(f"Received message: {msg.payload.decode()} on topic {msg.topic}")

    try:
        # 将接收到的消息解析为 JSON
        message_data = json.loads(msg.payload.decode())

        # 提取设备名
        device_name = message_data.get("device_name")

        # 从 JSON 中提取设备的其他变量（例如温度、湿度等）
        device_variables = {key: value for key, value in message_data.items() if key != "device_name"}

        # 打印解析后的设备名和变量
        print(f"Device Name: {device_name}")
        print(f"Device Variables: {device_variables}")

        # 在这里您可以根据需求进一步处理设备变量，例如存储到数据库等
    except json.JSONDecodeError:
        # 如果解码失败，打印错误信息
        print("Failed to decode JSON message.")


# 创建并连接 MQTT 客户端

# 获取配置
config = get_mqtt_config()

# 创建 MQTT 客户端实例
client = mqtt.Client(client_id=config['MQTT_CLIENT_ID'])

# 设置用户名和密码
client.username_pw_set(username=config['MQTT_USERNAME'], password=config['MQTT_PASSWORD'])

# 设置连接回调函数
client.on_connect = on_connect
# 设置接收到消息时的回调函数
client.on_message = on_message

# 连接到 MQTT 服务器
client.connect(config['MQTT_BROKER'], config['MQTT_PORT'], 60)

# 启动事件循环
client.loop_start()  # 使用 loop_start() 来异步运行

# 调用函数

