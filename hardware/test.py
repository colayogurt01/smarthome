'''
Author: cola yogurt zdx2725425693@gmail.com
Date: 2024-11-15 13:38:43
LastEditors: cola yogurt zdx2725425693@gmail.com
LastEditTime: 2024-11-19 22:11:59
FilePath: \hardware\Example.py
Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
'''
#》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》
#MQTT部分
import json
import network
import time
from umqtt.simple import MQTTClient


# 配置部分：MQTT 代理信息
MQTT_BROKER = 'broker.emqx.io'      # MQTT 代理地址
MQTT_PORT = 1883               # MQTT 代理端口
MQTT_TOPIC = 'test/sub'      # 订阅和发布的主题
MQTT_CLIENT_ID = 'mqttx_43579aec' # 客户端 ID
# MQTT_USER = 'MQTT1'        # 如果需要用户名
# MQTT_PASSWORD = 'zdx1314520'  # 如果需要密码

ssid = 'Xiaomi'    # Wi-Fi 名称
password = 'zdx1314520' # Wi-Fi 密码

# 连接 Wi-Fi 网络
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    
    while not wlan.isconnected():
        time.sleep(0.5)
        print('Connecting to WiFi...')
    
    print('Connected to WiFi:', wlan.ifconfig())

# 连接到 MQTT 代理
def connect_mqtt():
    try:
        client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, port=MQTT_PORT)
        client.connect()
        print('Connected to MQTT broker')
        return client
    except Exception as e:
        print('Failed to connect to MQTT broker:', e)
        return None

# 发布消息到指定主题
def publish_message(client, message):
    if client is not None:
        # 确保 message 是一个 JSON 字符串
        if isinstance(message, dict):  # 如果 message 是字典，转换为 JSON 字符串
            message = json.dumps(message)
        
        client.publish(MQTT_TOPIC, message)

        print('Message published:', message)
    else:
        print('MQTT client is not connected')

# 订阅主题并处理接收到的消息
def message_callback(topic, msg):
    print('Message received on topic {}: {}'.format(topic, msg))

def subscribe_to_topic(client):
    if client is not None:
        client.set_callback(message_callback)
        client.subscribe(MQTT_TOPIC)
        print(f'Subscribed to topic {MQTT_TOPIC}')
    else:
        print('MQTT client is not connected')
#》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》》


#硬件逻辑部分
#.................................................................................................................................................

from machine import Pin, PWM
import time
servo = None     

# 初始化硬件
def initHardware():
    initServo()

    print('Init Hardware')

# # 主工作函数
# def mainwork():
#     set_servo_speed(100)
#     time.sleep(10)
    

    
def initServo():
    global servo
    servo_pin = Pin(2, Pin.OUT)  # ESP32 GPIO 2 控制伺服电机
    servo = PWM(servo_pin, freq=50)  # 设置 PWM 的频率为 50Hz (适合伺服电机)
    print("Servo initialized.")
def set_servo_speed(speed):
    global servo
    if servo is not None:
        if speed<0:
            val=75+speed/2
        if speed>0:
            val=80+speed/2
        if speed==0:
            val=80
        servo.duty(int(val))  # 设置 PWM 占空比来改变伺服电机的角度
        print(f"Servo angle set to {speed}°")
    else:
        print("Servo not initialized.")



#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
# 主程序
def main():
    initHardware()
    # 连接 Wi-Fi
    connect_wifi()

    # 连接 MQTT
    client = connect_mqtt()

    if client is not None:
        # 订阅主题
        subscribe_to_topic(client)

        try:
            while True:


                mainwork()


                client.wait_msg()
                time.sleep(1)

        except KeyboardInterrupt:
            print('Disconnected from MQTT broker')
            client.disconnect()

# 启动主程序
if __name__ == '__main__':
#     main()
    initHardware()
    speed=-100
    while True:
        set_servo_speed(speed)
        speed=speed+1
        time.sleep(0.1)
        print(speed)
        
        


