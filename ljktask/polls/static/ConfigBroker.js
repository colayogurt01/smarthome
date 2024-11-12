

// 从后端获取 MQTT 配置并填充表单


    document.getElementById('showPassword').addEventListener('change', function() {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eye-icon');
        if (this.checked) {
            passwordInput.type = 'text';  // 显示密码
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');  // 改为闭眼图标
        } else {
            passwordInput.type = 'password';  // 隐藏密码
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');  // 改为眼睛图标
        }
    });

document.addEventListener('DOMContentLoaded', function() {
    // 监听表单提交
    document.getElementById('mqttConfigForm').addEventListener('submit', function(event) {
        event.preventDefault();
        submitMqttConfig(); // 调用提交函数
         fetchData();
    });

    document.getElementById("six").addEventListener("change", function () {
        if (this.checked) {
            // 当选择 "BROKER" 时更新配置
            fetchData();
        }
    });
});

// 提交表单的 AJAX 请求
function submitMqttConfig() {
    // 获取表单中的数据
    const serverAddress = document.getElementById('server_address').value;
    const port = document.getElementById('port').value;
    const clientId = document.getElementById('client_id').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 创建要提交的数据对象
    const mqttConfig = {
        server_address: serverAddress,
        port: port,
        client_id: clientId,
        username: username,
        password: password
    };

    // 使用 fetch 发送 POST 请求到后端
    fetch('/mqtt-servers/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value // CSRF token
        },
        body: JSON.stringify(mqttConfig)
    })
    .then(response => response.json())  // 确保正确解析 JSON 数据
    .then(data => {
        if (data) {
            alert('MQTT Broker Configuration Saved Successfully');
            console.log('MQTT Server Config Saved:', data);
        } else {
            alert('Error saving configuration');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error saving the configuration');
    });
}

function fetchData() {
    fetch('/mqtt-servers/')  // 假设 /mqtt-servers/ 是获取当前配置的 API 路径
        .then(response => response.json())
        .then(data => {

            console.log('Fetched Data:', data);
            if (data) {  // 如果返回的不是数组，而是单个对象
                const mqttConfig = data; // 假设返回的是一个单独的对象，而不是数组
                console.log('Fetched Data:', mqttConfig);
                console.log('Filling Server Address:', document.getElementById('server_address').value);
                console.log('Filling Port:', document.getElementById('port').value);
                console.log('Filling Client ID:', document.getElementById('client_id').value);
                console.log('Filling Username:', document.getElementById('username').value);
                console.log('Filling Password:', document.getElementById('password').value);


                // 填充表单
                document.getElementById('server_address').value = mqttConfig.server_address;
                document.getElementById('port').value = mqttConfig.port;
                document.getElementById('client_id').value = mqttConfig.client_id || '';
                document.getElementById('username').value = mqttConfig.username || '';
                document.getElementById('password').value = mqttConfig.password || '';
            } else {
                console.log("No MQTT configuration found");
            }
        })
        .catch(error => {
            console.error('Error fetching MQTT configuration:', error);
        });
}
