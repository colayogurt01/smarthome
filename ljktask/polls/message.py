import paho.mqtt.client as mqtt
import json

# MQTT 配置
MQTT_BROKER = "localhost"  # 替换为你的 MQTT 服务器地址
MQTT_PORT = 1883            # 替换为你的 MQTT 服务器端口
MQTT_PASSWORD = "zdx1314520"
MQTT_USERNAME = "MQTT1"
MQTT_ALive = 60#60s检测一次连接

# def on_connect(client, userdata, flags, rc):
#     # userdata 是传入的订阅主题列表
#     subscribe_topics = userdata  # 从 userdata 中获取主题列表
#     for topic in subscribe_topics:
#         client.subscribe(topic)  # 逐个订阅主题
#         print(f"Subscribed to topic: {topic} with result code {rc}")
def on_connect(client, userdata, flags, rc):
    client.subscribe("topic/test")  # 逐个订阅主题



# 当接收到消息时调用
def on_message(client, userdata, msg):
    # 解码负载
    payload = msg.payload.decode()

    # 打包成字典
    message_data = {
        "topic": msg.topic,
        "payload": payload
    }
    #将订阅主题和接受到的数据打包

    # 转换为 JSON 字符串
    json_data = json.dumps(message_data)

    print(f"打包后的 JSON 数据: {json_data}")

    return json_data  # 返回 JSON 字符串


# 解码负载

# 创建 MQTT 客户端实例-
client = mqtt.Client()

# 绑定回调函数
client.on_connect = on_connect
client.on_message = on_message

# 连接到 MQTT 服务器
client.username_pw_set(username=MQTT_USERNAME, password=MQTT_PASSWORD)
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# 启动循环以处理网络流量
client.loop_start()  # 使用 loop_start() 以便在后台运行
