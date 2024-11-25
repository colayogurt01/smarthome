# Python标准库
import json

# Django标准库
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

# Django REST Framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# 本地应用导入
from .models import Device, DeviceVariable, MqttServer
from .models import ConditionScript,  TimerScript
from .serializers import MqttServerSerializer
from .message import client, subscribe_device_topics, disconnectMqtt, connectMqtt ,publish_message,start_all_timers,stop_all_timers# 导入 MQTT 客户端功能



# 作者: cola yogurt
def login_view(request):
    """
    处理用户登录请求。

    该视图用于处理用户的登录请求，验证用户名和密码。如果验证成功，
    用户将登录并重定向到主页。如果验证失败，将返回错误信息。

    :param request: HTTP 请求对象
    :return: HTTP 响应对象
    """
    if request.method == 'POST':  # 检查是否为 POST 请求
        username = request.POST.get('username')  # 获取表单中提交的用户名
        password = request.POST.get('password')  # 获取表单中提交的密码
        remember = request.POST.get('remember')  # 获取记住我的状态

        # 使用 authenticate 函数验证用户名和密码
        user = authenticate(request, username=username, password=password)

        if user is not None:  # 如果认证成功
            login(request, user)  # 执行登录操作
            return redirect('home')  # 登录成功后重定向到主页
        else:  # 如果用户名或密码错误
            return JsonResponse({'error': '用户名或密码错误'}, status=401)  # 返回错误信息

    # 如果是 GET 请求，渲染登录页面
    return render(request, 'polls/login.html')


# 作者: cola yogurt

@login_required  # 装饰器，要求用户登录才能访问该视图
def home_view(request):
    """
    处理主页视图。

    该视图用于渲染主页模板，只有在用户登录后才能访问。如果用户未登录，
    将会自动重定向到登录页面。

    :param request: HTTP 请求对象
    :return: HTTP 响应对象，渲染主页模板
    """
    return render(request, 'polls/home.html')  # 渲染主页模板并返回响应


# 作者: cola yogurt

def get_device_list(request):
    """
    获取所有设备的列表并返回 JSON 格式的数据。

    :param request: HTTP 请求对象
    :return: HTTP 响应对象，包含所有设备的 JSON 数据
    """
    print("Received GET request get_device_list")

    devices = Device.objects.all()  # 获取所有设备
    device_data = []

    # 遍历设备，构建设备数据字典
    for device in devices:
        device_data.append({
            'device_id': device.id,
            'device_name': device.device_name,
            'device_client_id': device.client_id,
            'device_topic': device.device_topic,
            'device_values': [
                {
                    'value_type': var.value_type,
                    'data_direction': var.data_direction,
                    'value_name': var.value_name
                }
                for var in device.variables.all()
            ]
        })

    # 返回 JSON 响应
    return JsonResponse({'devices': device_data})

# 作者: cola yogurt

def add_device(request):
    """
    添加一个新设备并将其保存到数据库。

    :param request: HTTP 请求对象，包含设备信息的 POST 请求
    :return: JSON 响应对象，表示设备添加的状态
    """
    if request.method == 'POST':  # 检查是否是 POST 请求
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
                data_direction = variable.get('dataDirection', 'both')  # 默认 data_direction 为 'both'

                # 创建 DeviceVariable 实例并保存
                DeviceVariable.objects.create(
                    device=device,
                    value_name=value_name,
                    value_type=value_type,
                    data_direction=data_direction
                )
            subscribe_device_topics(client)
            print("Device")

            return JsonResponse({'status': 'success', 'message': 'Device added successfully'}, status=200)

        except json.JSONDecodeError:
            # 处理 JSON 格式错误
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            # 捕获其他所有异常并打印
            print(f"Error: {e}")
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)

    # 如果请求方法不是 POST，返回方法不允许错误
    return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)


# 作者: cola yogurt

@csrf_exempt  # 禁用 CSRF 校验，允许跨站请求
def delete_device(request, device_id):
    """
    删除指定设备。

    :param request: HTTP 请求对象
    :param device_id: 要删除的设备 ID
    :return: JSON 响应对象，表示删除结果
    """
    print("Received DELETE request delete_device")
    print(request.method)  # 打印请求方法
    print(request.body)  # 打印请求体
    print(device_id)  # 打印设备 ID

    if request.method == 'DELETE':  # 检查是否是 DELETE 请求
        # 获取指定 ID 的设备，如果找不到则返回 404 错误
        device = get_object_or_404(Device, id=device_id)

        # 删除设备
        device.delete()

        # 返回成功删除的响应
        subscribe_device_topics(client)
        return JsonResponse({'message': 'Device deleted successfully!'})

    # 如果请求方法不是 DELETE，返回错误响应
    return JsonResponse({'error': 'Invalid request method'}, status=400)


# 作者: cola yogurt

class MqttServerList(APIView):
    """
    处理获取和更新 MQTT 服务器配置的视图类。

    - GET 请求：返回当前 MQTT 服务器的配置信息。
    - POST 请求：更新配置，若不存在配置则创建默认配置并重新连接到 MQTT 服务器。
    """

    def get(self, request):
        """
        处理 GET 请求，返回当前的 MQTT 服务器配置信息。

        :param request: HTTP 请求对象
        :return: HTTP 响应对象，包含 MQTT 服务器的配置信息或错误消息
        """
        print("Received GET request MqttServerList")

        # 获取唯一的配置记录
        mqtt_server = MqttServer.objects.first()

        if mqtt_server:
            # 如果找到配置记录，使用序列化器将其数据转化为 JSON 格式
            serializer = MqttServerSerializer(mqtt_server)
            return Response(serializer.data)

        # 如果没有找到配置记录，返回 404 错误
        return Response({"message": "No MQTT server configuration found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """
        处理 POST 请求，更新或创建唯一的 MQTT 服务器配置，并重新连接到服务器。

        :param request: HTTP 请求对象，包含 MQTT 配置的数据
        :return: HTTP 响应对象，包含更新后的配置数据
        """
        print("Received POST request")

        # 只允许创建或更新唯一的配置记录
        mqtt_server = MqttServer.get_or_create_default_config(data=request.data)

        # 使用序列化器将 MQTT 服务器配置转化为 JSON 格式
        serializer = MqttServerSerializer(mqtt_server)

        # 断开当前的 MQTT 连接并重新连接
        disconnectMqtt(client)
        connectMqtt()

        # 返回更新后的配置数据
        return Response(serializer.data, status=status.HTTP_200_OK)


# 作者: cola yogurt

@csrf_exempt  # 禁用 CSRF 校验，允许跨站请求
def set_device_value(request):
    """
    处理设备值设置请求，更新设备变量的值并发布 MQTT 消息。

    :param request: HTTP 请求对象，包含设备 ID、变量名和值
    :return: HTTP 响应对象，表示操作结果
    """
    if request.method == 'POST':  # 仅接受 POST 请求
        try:
            # 解析请求体中的 JSON 数据
            data = json.loads(request.body)

            # 提取设备 ID、变量名和值
            device_id = data.get('deviceId')
            value_name = data.get('valueName')
            value = data.get('value')

            # 验证必需的数据是否存在
            if not device_id or not value_name or value is None:
                return JsonResponse({'success': False, 'message': 'Missing required fields'})

            try:
                # 获取设备信息
                device = Device.objects.get(id=device_id)
            except Device.DoesNotExist:
                return JsonResponse({'success': False, 'message': f'Device with ID {device_id} not found'})

            # 生成设备主题
            device_topic = f"{device.device_name}/{device.device_topic}"

            # 发布消息到设备主题
            publish_message(device_topic, {value_name: value})

            # 返回成功响应
            return JsonResponse({'success': True, 'message': 'Message published successfully'})

        except json.JSONDecodeError:
            # 处理 JSON 格式错误
            return JsonResponse({'success': False, 'message': 'Invalid JSON format'})
        except Exception as e:
            # 捕获其他所有异常
            return JsonResponse({'success': False, 'message': str(e)})

    # 如果请求方法不是 POST，返回错误响应
    return JsonResponse({'success': False, 'message': 'Invalid request method'})


# 作者: cola yogurt




# views.py



@csrf_exempt
def add_condition_script(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        # 使用设备名称代替设备 ID 来查找设备实例
        date_source_device = Device.objects.get(device_name=data['condition_device'])
        execute_device = Device.objects.get(device_name=data['performer_device'])

        # 创建 ConditionScript 实例并保存
        condition_script = ConditionScript(
            date_source_device_name=date_source_device,  # 使用设备实例
            date_source_variable_name=data['condition_variable'],
            condution_operator=data['condition_operator'],
            condition_value=data['condition_value'],
            execute_device_name=execute_device,  # 使用设备实例
            execute_variable_name=data['control_variable'],
            execute_device_value=data['script_value']
        )

        # 打印数据并保存到数据库
        print(data)
        condition_script.save()

        return JsonResponse({'message': 'Condition Script added successfully'})

@csrf_exempt
def add_timer_script(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        # 使用设备名称代替设备 ID 来查找设备实例
        execute_device = Device.objects.get(device_name=data['performer_device'])

        # 创建 TimerScript 实例并保存
        timer_script = TimerScript(
            timer_type=data['timer_type'],
            timer_value=data['timer_condition_value'],
            execute_device_name=execute_device,  # 使用设备实例
            execute_variable_name=data['control_variable'],
            execute_device_value=data['timer_script_value']
        )

        # 保存定时脚本
        timer_script.save()
        stop_all_timers()
        start_all_timers()
        return JsonResponse({'message': 'Timer Script added successfully'})

def get_condition_scripts(request):
    # 获取所有 ConditionScript 条目
    condition_scripts = ConditionScript.objects.all()

    data = []
    for script in condition_scripts:
        # 获取每个 ConditionScript 实例的相关数据
        data.append({
            'device_id': script.id,  # 使用数据库的主键作为 device_id
            'device_name': script.date_source_device_name,
            'condition_variable': script.date_source_variable_name,
            'condition_operator': script.condution_operator,
            'condition_value': script.condition_value,
            'execute_device_name': script.execute_device_name,
            'execute_variable_name': script.execute_variable_name,
            'execute_value': script.execute_device_value,
        })

    # 返回 JSON 格式的数据
    return JsonResponse({'condition_scripts': data})

@csrf_exempt  # 如果使用了 CSRF Token 防护，请确保装饰器
def delete_condition_script(request, device_id):
    if request.method == 'DELETE':
        try:
            # 获取并删除相应的条件脚本
            condition_script = ConditionScript.objects.get(id=device_id)  # 使用 id 而非 device_id
            condition_script.delete()
            return JsonResponse({'success': True})
        except ConditionScript.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Condition script not found'}, status=404)

    return JsonResponse({'success': False, 'error': 'Invalid method'}, status=400)

def get_timer_scripts(request):
    # 获取所有 TimerScript 条目
    timer_scripts = TimerScript.objects.all()

    data = []
    for script in timer_scripts:
        # 获取每个 TimerScript 实例的相关数据
        data.append({
            'device_id': script.id,  # 使用数据库的主键作为 device_id
            'timer_type': script.timer_type,
            'timer_value': script.timer_value,
            'execute_device_name': script.execute_device_name,
            'execute_variable_name': script.execute_variable_name,
            'execute_device_value': script.execute_device_value,
        })

    # 返回 JSON 格式的数据
    return JsonResponse({'timer_scripts': data})

@csrf_exempt  # 如果使用了 CSRF Token 防护，请确保装饰器
def delete_timer_script(request, device_id):
    if request.method == 'DELETE':
        try:
            # 获取并删除相应的定时器脚本
            timer_script = TimerScript.objects.get(id=device_id)  # 使用 id 而非 device_id
            timer_script.delete()
            stop_all_timers()
            start_all_timers()

            return JsonResponse({'success': True})
        except TimerScript.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Timer script not found'}, status=404)

    return JsonResponse({'success': False, 'error': 'Invalid method'}, status=400)