import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from .message import client,on_connect  # 导入 MQTT 客户端
from django.http import JsonResponse
from .models import Device, DeviceVariable,MqttServer
import json


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember = request.POST.get('remember')  # 获取记住我的状态

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            return JsonResponse({'error': '用户名或密码错误'}, status=401)

    return render(request, 'login.html')


# 主页
@login_required
def home_view(request):
    return render(request, 'home.html')
def get_device_list(request):
    print("Received GET requestget_device_list")
    devices = Device.objects.all()  # 获取所有设备
    device_data = []
    for device in devices:
        device_data.append({
            'device_id': device.id,
            'device_name': device.device_name,
            'device_client_id': device.client_id,  # 假设你有设备客户端 ID 字段
            'device_topic': device.device_topic,
            'device_values': [{'value_type': var.value_type, 'data_direction': var.data_direction, 'value_name': var.value_name} for var in device.variables.all()]  # 获取设备的所有变量
        })
    return JsonResponse({'devices': device_data})

def add_device(request):
    if request.method == 'POST':
        print("Received POST request")
        try:
            # 解析请求体中的 JSON 数据
            data = json.loads(request.body)

            # 获取设备名称、主题及设备变量
            device_name = data.get('deviceName')
            device_topic = data.get('deviceTopic')
            device_variables = data.get('deviceVariables', [])

            # 检查设备名称是否已存在
            if Device.objects.filter(device_name=device_name).exists():
                return JsonResponse({'status': 'error', 'message': 'Device with this name already exists'}, status=400)

            # 创建设备实例并保存
            device = Device.objects.create(
                device_name=device_name,
                device_topic=device_topic
            )

            # 保存设备的变量
            for variable in device_variables:
                value_name = variable.get('valueName')
                value_type = variable.get('valueType')
                data_direction = variable.get('dataDirection', 'both')  # 如果没有提供 data_direction, 默认使用 'both'


                # 创建 DeviceVariable 实例
                DeviceVariable.objects.create(
                    device=device,
                    value_name=value_name,
                    value_type=value_type,
                    data_direction=data_direction
                )
            on_connect();

            return JsonResponse({'status': 'success', 'message': 'Device added successfully'}, status=200)

        except json.JSONDecodeError:
            # 处理 JSON 格式错误
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            # 捕获其他所有异常
            print(f"Error: {e}")
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)

    # 如果不是 POST 请求，返回方法不允许错误
    return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)


@csrf_exempt
def delete_device(request, device_id):
    print("Received DELETE requestdelete_device")
    print(request.method)  # 打印请求方法
    print(request.body)  # 打印请求体
    print(device_id)  # 打印设备 ID
    if request.method == 'DELETE':
        device = get_object_or_404(Device, id=device_id)
        device.delete()
        on_connect();
        return JsonResponse({'message': 'Device deleted successfully!'})
    return JsonResponse({'error': 'Invalid request method'}, status=400)


from django.shortcuts import render
from django.http import JsonResponse
from .models import MqttServer
from django.views.decorators.csrf import csrf_exempt

# 处理 MQTT 配置页面请求

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import MqttServer
from .serializers import MqttServerSerializer

class MqttServerList(APIView):
    def get(self, request):
        print("Received GET requestMqttServerList")
        # 获取唯一的配置记录
        mqtt_server = MqttServer.objects.first()
        if mqtt_server:
            serializer = MqttServerSerializer(mqtt_server)
            return Response(serializer.data)
        return Response({"message": "No MQTT server configuration found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        print("Received POST request")
        # 只允许创建或更新唯一的配置记录
        mqtt_server = MqttServer.get_or_create_default_config(data=request.data)
        serializer = MqttServerSerializer(mqtt_server)
        return Response(serializer.data, status=status.HTTP_200_OK)
#控制设备
#接受前端发送的数据
# @api_view(['POST'])
# def control_device(request):
#     if request.method == 'POST':
#         set_subject = "test/topic"#后续升级可以修改
#         state = request.POST.get('state')
#         # device_name = request.POST.get('device_name')
#         if state == "on":
#             state_value=1;
#         else:
#             state_value=0;
#     #  data = {
#     #         device_name: {
#     #                         "temp": temperature,
#     #                         "humi": humidity
#     #                     },
#     #             "version": "1.0.0"
#     # }
#         data = {'state': state_value}
#
#         json_string = json.dumps(data)
#         print(json_string)
#         client.publish(set_subject, json_string)
#         return Response(data, status=200)
#     return Response({"error": "Invalid request"}, status=400)  # 处理其他情




#发布消息到MQTT服务器


#接受设备消息
#从MQTT服务器订阅主题
#监听MQTT服务器的消息
#这部分在Message.py中
#使用时回调函数就可以