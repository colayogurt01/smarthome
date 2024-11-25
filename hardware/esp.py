import json
import network
import time
from umqtt.simple import MQTTClient
import machine
from machine import Pin, PWM
import dht
import ssd1306

# 配置部分：MQTT 代理信息
MQTT_BROKER = 'broker.emqx.io'  # MQTT 代理地址
MQTT_PORT = 1883                # MQTT 代理端口
DEVICE_NAME = 'test'            # 设备名称
MQTT_CLIENT_ID = '12344556'     # 客户端 ID
SSID = 'Xiaomi'                 # Wi-Fi 名称
PASSWORD = 'zdx1314520'         # Wi-Fi 密码

# 定义主题前缀，统一管理发布和订阅的主题
MQTT_TOPIC_PREFIX = "test/topic"

# 初始化全局变量
sensor = None
servo = None
oled = None
client = None
state = False  # 是否有任务处理
line_num=1
# 初始化 DHT11 传感器
def init_dht11():
    global sensor
    sensor = dht.DHT11(Pin(9))

# 获取温湿度数据并发布
def publish_tem_hum():
    global client
    try:
        sensor.measure()
        temperature = sensor.temperature()  # 获取温度
        humidity = sensor.humidity()        # 获取湿度

        print(f'Temperature: {temperature}°C')
        print(f'Humidity: {humidity}%')

        # 发布温湿度数据
        publish_message(client, variable_name='temperature', variable_value=temperature)
        publish_message(client, variable_name='humidity', variable_value=humidity)

    except Exception as e:
        print('Failed to read sensor:', e)

# 初始化舵机
def init_servo():
    global servo
    servo_pin = Pin(8, Pin.OUT)  # ESP32 GPIO 2 控制伺服电机
    servo = PWM(servo_pin, freq=50)  # 设置 PWM 的频率为 50Hz (适合伺服电机)
    print("Servo initialized.")

# 设置舵机速度
def set_servo_speed(speed):
    global servo
    if servo is not None:
        if speed < 0:
            val = max(40, min(115, 75 + speed // 2))  # 限制占空比范围
        elif speed > 0:
            val = max(40, min(115, 80 + speed // 2))  # 限制占空比范围
        else:
            val = 75  # 中立位置
        servo.duty(int(val))  # 设置 PWM 占空比来改变伺服电机的角度
        print(f"Servo angle set to {speed}°")
    else:
        print("Servo not initialized.")

# 初始化 OLED 显示屏
def init_oled():
    global oled
    i2c = machine.I2C(0, scl=Pin(5), sda=Pin(4))  # 根据实际连接修改
    oled = ssd1306.SSD1306_I2C(128, 64, i2c)
    oled.fill(0)

# OLED显示文本
def print_oled(text):
    global line_num
    
    
    oled.text(text, 10, (line_num*10))
    if(line_num>5):
        line_num=0
        oled.fill(0)
    oled.show()
    line_num=line_num+1


# 配置网络连接
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)

    timeout = 30  # 设置超时为30秒
    while not wlan.isconnected() and timeout > 0:
        time.sleep(0.5)
        timeout -= 1
        print('Connecting to WiFi...')
    
    if wlan.isconnected():
        print('Connected to WiFi:', wlan.ifconfig())
    else:
        print('WiFi connection failed')
        return False
    return True

# 连接到 MQTT 代理
def connect_mqtt():
    global client  # 声明 client 为全局变量
    try:
        client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, port=MQTT_PORT)
        client.connect()
        print('Connected to MQTT broker')
        return client
    except Exception as e:
        print('Failed to connect to MQTT broker:', e)
        return None

# 发布消息到 MQTT 代理
def publish_message(client, variable_name, variable_value):
    publish_topic = f"{MQTT_TOPIC_PREFIX}/pub"
    message = {
        "device_name": DEVICE_NAME,
        variable_name: variable_value
    }
    mqtt_message = json.dumps(message)
    print(f"Publishing message to topic: {publish_topic}")
    print(f"Message: {mqtt_message}")
    client.publish(publish_topic, mqtt_message)

# 订阅 MQTT 主题并处理消息
def message_callback(topic, msg):
    try:
        message_str = msg.decode('utf-8')
        message = json.loads(message_str)
        print(f"Message received on topic {topic}: {message}")

        speed = message.get("speed")
        if speed is not None:
            try:
                set_servo_speed(int(speed))
            except ValueError:
                print(f"Invalid speed value: {speed}")
        
        print_oled_message = message.get("print_oled")
        if print_oled_message:
            print_oled(print_oled_message)

    except Exception as e:
        print(f"Error parsing message: {e}")
        print(f"Received message: {msg}")  # 打印原始消息，帮助调试

# 订阅 MQTT 主题
def subscribe_to_topic(client):
    if client is not None:
        subscribe_topic = f"{MQTT_TOPIC_PREFIX}/sub"
        client.set_callback(message_callback)
        client.subscribe(subscribe_topic)
        print(f'Subscribed to topic {subscribe_topic}')
    else:
        print('MQTT client is not connected')

# 初始化硬件
def init_hardware():
    print('Initializing hardware...')
    init_dht11()
    init_servo()
    init_oled()
    print('Hardware initialized')

# 主程序
def main():
    init_hardware()
    if not connect_wifi():
        print("Wi-Fi connection failed. Exiting...")
        return

    global client
    client = connect_mqtt()

    if client is not None:
        subscribe_to_topic(client)
        try:
            last_publish_time = time.ticks_ms()
            while True:
                current_time = time.ticks_ms()
                if time.ticks_diff(current_time, last_publish_time) >= 1000:
                    publish_tem_hum()
                    last_publish_time = current_time

                client.check_msg()
                time.sleep(0.1)  # 适当休眠，避免过度占用 CPU

        except KeyboardInterrupt:
            print('Disconnected from MQTT broker')
            client.disconnect()

# 启动主程序
if __name__ == '__main__':
    main()

