smarthome
介绍
这是一个类似于米家的智能家居系统，仅仅支持通过 MQTT 协议进行设备的连接和控制。

软件架构
本项目采用了典型的客户端-服务器架构，客户端与服务器通过 MQTT 协议进行通信。服务器基于 Django 框架搭建，使用 WebSocket 实现实时推送数据。客户端基于 Web 前端技术（HTML/CSS/JavaScript）进行实现，提供设备监控、控制和数据展示功能。

服务器端：基于 Django，提供设备管理、用户管理、实时数据推送等功能。
前端：基于 HTML、CSS 和 JavaScript 实现界面展示，支持用户控制家居设备的开关、设置等。
通信协议：MQTT，提供低延迟、可靠的设备控制与数据交换。
安装教程
安装 Python 环境 确保已经安装了 Python 3.8 及以上版本。可以使用以下命令进行安装：

sudo apt install python3 python3-pip
安装 Django 和依赖包 在项目目录下，使用以下命令安装所需的依赖：

pip install -r requirements.txt
requirements.txt 文件包含了所有必需的 Python 包。

配置 MQTT 代理 使用 EMQX 公共 MQTT 代理进行通信。可以参考 EMQX 官方文档进行安装和配置 EMQX官网。确保你的设备和服务器能够连接到代理。

启动 Django 服务器 在项目目录下，使用以下命令启动服务器：

python manage.py runserver
使用说明
创建用户账户 首次使用时，你需要通过 Django 提供的管理员界面创建一个管理员账户。可以在浏览器中访问 http://127.0.0.1:8000/admin/。

设备管理 登录管理员账户后，可以通过平台的设备管理界面添加、删除和管理智能设备。设备会通过 MQTT 协议与平台通信，支持实时状态更新。

控制设备 在前端界面，你可以控制设备的开关、设置模式、查看设备状态等。每次操作都会通过 MQTT 消息发送到对应的设备。