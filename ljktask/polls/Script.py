import threading
from .models import TimerScript,Device
from .message import publish_message  # 假设 publish_message 函数定义在 mqtt.py
import json
# from message import client
def start_all_timers():
    """启动所有定时任务"""
    timers = TimerScript.objects.all()
    for timer_script in timers:
        threading.Thread(target=start_timer_script, args=(timer_script,)).start()

def start_timer_script(timer_script):
    """根据定时器设置启动定时任务"""
    if timer_script.timer_type == 'after_num_seconds':
        threading.Timer(timer_script.timer_value, perform_action, [timer_script]).start()
    elif timer_script.timer_type == 'every_num_seconds':
        def repeat_task():
            perform_action(timer_script)
            threading.Timer(timer_script.timer_value, repeat_task).start()

        repeat_task()
    elif timer_script.timer_type == 'after_num_minutes':
        threading.Timer(timer_script.timer_value * 60, perform_action, [timer_script]).start()
    elif timer_script.timer_type == 'every_num_minutes':
        def repeat_task():
            perform_action(timer_script)
            threading.Timer(timer_script.timer_value * 60, repeat_task).start()

        repeat_task()

def perform_action(timer_script):
    """执行具体的设备操作，包括发送 MQTT 消息"""
    print(f"Executing action for Timer Script: {timer_script.id}")

    # 调用 send_mqtt_message 函数发送消息
    send_mqtt_message(timer_script)

def send_mqtt_message(timer_script):
    """根据定时器的设置发送 MQTT 消息"""
    try:
        # 获取设备对象
        device = Device.objects.get(device_name=timer_script.execute_device_name)

        # 设备的主题和要发布的消息
        topic = f"{device.device_name}/{device.device_topic}"
        print(f"Sending message to {topic}")

        message = {
            timer_script.execute_variable_name: timer_script.execute_device_value
        }  # 消息内容
        print(message)

        # # 使用 publish_message 函数发送消息
        # # 将消息内容转换为 JSON 格式的字符串
        # message_str = json.dumps(message)
        #
        # # 使用 MQTT 客户端发布消息到指定主题
        # client.publish(topic, message_str)
        publish_message(topic, message)

    except Device.DoesNotExist:
        print(f"Device {timer_script.execute_device_name} not found!")
    except Exception as e:
        print(f"Error sending MQTT message: {e}")
