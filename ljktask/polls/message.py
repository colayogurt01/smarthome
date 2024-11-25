import paho.mqtt.client as mqtt
from .models import MqttServer, Device,DeviceVariable
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json
import threading
from .models import TimerScript,Device,ConditionScript

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

    # 获取设备的订阅主题，并加上 `/pub` 后缀
    topics = get_device_subscriptions()

    # 逐个订阅设备的主题，加上 /pub
    for topic in topics:
        topic_with_pub = f"{topic}/pub"
        print(f"Subscribing to topic: {topic_with_pub}")
        client.subscribe(topic_with_pub)  # 订阅每个设备的主题
        print(f"Subscribed to topic: {topic_with_pub}")

    if rc == 0:
        print("连接成功")
    else:
        print(f"连接失败，返回码 {rc}")

def subscribe_device_topics(client):
    # 获取设备的订阅主题，并加上 `/pub` 后缀
    topics = get_device_subscriptions()

    # 逐个订阅设备的主题，加上 /pub
    for topic in topics:
        topic_with_pub = f"{topic}/pub"
        print(f"Subscribing to topic: {topic_with_pub}")
        client.subscribe(topic_with_pub)  # 订阅每个设备的主题
        print(f"Subscribed to topic: {topic_with_pub}")

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





        channel_layer = get_channel_layer()  # 重要代码
        async_to_sync(channel_layer.group_send)("device_data_device_data_room",
                                                {"type": "send_data_to_frontend",
                                                 "message": formatted_data
                                                 }
                                                )  # 重要代码
        # print(message_data)
        print("Data sent to WebSocket consumer.")

# 获取相关的 ConditionScript 条件
        condition_scripts = ConditionScript.objects.filter(date_source_device_name=device_name)

        # 遍历所有条件脚本，并根据条件判断是否满足执行
        for condition_script in condition_scripts:
            # 获取变量名称和条件值，并将条件值转换为浮动数
            variable_name = condition_script.date_source_variable_name
            condition_value = float(condition_script.condition_value)  # 转换为浮动数
            operator = condition_script.condution_operator

            value = formatted_data.get(variable_name)
            if value is None:
                print(f"Warning: {variable_name} not found in the formatted data.")
                continue

            # 确保接收到的值是浮动数类型
            try:
                value = float(value)
            except ValueError:
                print(f"Error: Value of {variable_name} is not a valid number.")
                continue

            # 执行条件判断
            condition_met = False
            if operator == 'equal' and value == condition_value:
                condition_met = True
            elif operator == 'greater_than' and value > condition_value:
                condition_met = True
            elif operator == 'less_than' and value < condition_value:
                condition_met = True
            elif operator == 'not_equal' and value != condition_value:
                condition_met = True

            if condition_met:
                # 如果满足条件，执行相应操作
                print(f"Condition met for {device_name}: {variable_name} {operator} {condition_value}")
                perform_action(condition_script)


    except json.JSONDecodeError:
        print("Failed to decode JSON message.")
    except Exception as e:
        print(f"Unexpected error: {e}")




def perform_action(condition_script):
    """根据条件执行动作，发送 MQTT 消息或执行其他操作"""
    print(f"Executing action for {condition_script.execute_device_name}...")

    # 假设我们要执行 MQTT 消息发布
    device_name = condition_script.execute_device_name
    variable_name = condition_script.execute_variable_name
    device_value = condition_script.execute_device_value

    try:
        # 获取设备并发布消息
        device = Device.objects.get(device_name=device_name)
        topic = f"{device.device_name}/{device.device_topic}"
        message = {variable_name: device_value}

        # 发布消息
        publish_message(topic, message)
        print(f"Message sent to {topic}: {message}")

    except Device.DoesNotExist:
        print(f"Error: Device {device_name} not found.")
    except Exception as e:
        print(f"Error during action execution: {e}")


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
    start_all_timers()
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
def publish_message(topic, message):
    """
    向指定的 MQTT 主题发布消息。

    :param topic: 发布消息的主题
    :param message: 要发布的消息内容，应该是一个字典或者可转为 JSON 的对象
    """
    # 将主题加上 `/sub` 后缀
    topic_with_sub = f"{topic}/sub"

    # 打印调试信息，输出发布的主题和消息
    print("Publishing message to topic:", topic_with_sub)
    print("Message:", message)

    # 将消息内容转换为 JSON 格式的字符串
    message_str = json.dumps(message)

    # 使用 MQTT 客户端发布消息到指定主题
    client.publish(topic_with_sub, message_str)

# 一个全局变量，用来保存所有定时器线程
active_timers = []

def start_all_timers():
    """启动所有定时任务"""
    timers = TimerScript.objects.all()
    for timer_script in timers:
        timer = threading.Thread(target=start_timer_script, args=(timer_script,))
        active_timers.append(timer)  # 将线程加入全局的 active_timers 列表
        timer.start()

def start_timer_script(timer_script):
    """根据定时器设置启动定时任务"""
    if timer_script.timer_type == 'after_num_seconds':
        timer = threading.Timer(timer_script.timer_value, perform_action, [timer_script])
        active_timers.append(timer)  # 将定时器加入全局的 active_timers 列表
        timer.start()
    elif timer_script.timer_type == 'every_num_seconds':
        def repeat_task():
            perform_action(timer_script)
            timer = threading.Timer(timer_script.timer_value, repeat_task)
            active_timers.append(timer)
            timer.start()

        repeat_task()
    elif timer_script.timer_type == 'after_num_minutes':
        timer = threading.Timer(timer_script.timer_value * 60, perform_action, [timer_script])
        active_timers.append(timer)  # 将定时器加入全局的 active_timers 列表
        timer.start()
    elif timer_script.timer_type == 'every_num_minutes':
        def repeat_task():
            perform_action(timer_script)
            timer = threading.Timer(timer_script.timer_value * 60, repeat_task)
            active_timers.append(timer)
            timer.start()

        repeat_task()

def stop_all_timers():
    """停止所有正在运行的定时器"""
    global active_timers
    for timer in active_timers:
        if isinstance(timer, threading.Timer):  # 只取消 Timer 类型的定时器
            timer.cancel()  # 停止定时器
            print("Stopped a timer.")
    active_timers = []  # 清空定时器列表
def perform_action(timer_script):
    """执行具体的设备操作，包括发送 MQTT 消息"""

    # 调用 send_mqtt_message 函数发送消息
    """根据定时器的设置发送 MQTT 消息"""
    try:
        # 获取设备对象
        device = Device.objects.get(device_name=timer_script.execute_device_name)

        # 设备的主题和要发布的消息
        topic = f"{device.device_name}/{device.device_topic}"
        message = {
            timer_script.execute_variable_name: timer_script.execute_device_value
        }  # 消息内容

        publish_message(topic, message)

    except Device.DoesNotExist:
        print(f"Device {timer_script.execute_device_name} not found!")
    except Exception as e:
        print(f"Error sending MQTT message: {e}")



client=connectMqtt()


