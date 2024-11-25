// 假设有两个选择框：设备选择框（deviceSelect）和变量选择框（variableSelect）

document.getElementById("two").addEventListener("change", function () {
        if (this.checked) {
            // 当选择 "BROKER" 时更新配置
            loadDevices1();
            loadDevices2();
            loadDevices3();
        }
    });
function loadDevices1() {
    // 发送请求获取设备数据
    fetch('/get_device_list/')  // 获取设备列表的 API 路径
        .then(response => response.json())  // 解析 JSON 格式的数据
        .then(data => {
            const devices = data.devices;  // 从响应数据中获取设备列表
            const deviceSelect = document.getElementById('ConditionDeviceSelect');  // 获取设备选择框
            const variableSelect = document.getElementById('ConditionVariableSelect');  // 获取变量选择框

            // 清空现有设备和变量选择框的内容
            deviceSelect.innerHTML = '<option value="">Select Device</option>';
            variableSelect.innerHTML = '<option value="">Select Variable</option>';

            // 填充设备选择框
            devices.forEach(device => {
                const option = document.createElement('option');  // 创建新的选项
                option.value = device.device_name;  // 使用设备名称作为选项的值
                option.textContent = device.device_name;  // 设备名称作为选项的文本
                deviceSelect.appendChild(option);  // 将设备选项添加到设备选择框中
            });

            // 为设备选择框添加 change 事件监听器，动态加载变量
            deviceSelect.addEventListener('change', function() {
                const selectedDeviceName = this.value;  // 获取当前选择的设备名称
                const selectedDevice = devices.find(device => device.device_name === selectedDeviceName);  // 查找对应的设备

                // 清空变量选择框
                variableSelect.innerHTML = '<option value="">Select Variable</option>';

                // 如果设备被选中，填充该设备的变量到变量选择框
                if (selectedDevice) {
                    selectedDevice.device_values.forEach(variable => {
                        // 只筛选出符合条件的变量：例如 int 或 float 类型，并且数据方向是接收（receive）或双向（both）
                        if ((variable.value_type === 'int' || variable.value_type === 'float') &&
                            (variable.data_direction === 'receive' || variable.data_direction === 'both')) {

                            const option = document.createElement('option');  // 创建新的变量选项
                            option.value = variable.value_name;  // 变量名称作为选项的值
                            option.textContent = `${variable.value_name} (${variable.value_type})`;  // 变量名称和类型作为选项的文本
                            variableSelect.appendChild(option);  // 将变量选项添加到变量选择框中
                        }
                    });
                }
            });
        })
        .catch(error => {
            console.error('Error loading device list:', error);  // 捕获并显示错误信息
        });
}

function loadDevices2() {
    // 发送请求获取设备数据
    fetch('/get_device_list/')  // 获取设备列表的 API 路径
        .then(response => response.json())  // 解析 JSON 格式的数据
        .then(data => {
            const devices = data.devices;  // 从响应数据中获取设备列表
            const deviceSelect = document.getElementById('scriptDeviceSelect');  // 获取设备选择框
            const variableSelect = document.getElementById('scriptVariableSelect');  // 获取变量选择框

            // 清空现有设备和变量选择框的内容
            deviceSelect.innerHTML = '<option value="">Select Device</option>';
            variableSelect.innerHTML = '<option value="">Select Variable</option>';

            // 填充设备选择框
            devices.forEach(device => {
                const option = document.createElement('option');  // 创建新的选项
                option.value = device.device_name;  // 使用设备名称作为选项的值
                option.textContent = device.device_name;  // 设备名称作为选项的文本
                deviceSelect.appendChild(option);  // 将设备选项添加到设备选择框中
            });

            // 为设备选择框添加 change 事件监听器，动态加载变量
            deviceSelect.addEventListener('change', function() {
                const selectedDeviceName = this.value;  // 获取当前选择的设备名称
                const selectedDevice = devices.find(device => device.device_name === selectedDeviceName);  // 查找对应的设备

                // 清空变量选择框
                variableSelect.innerHTML = '<option value="">Select Variable</option>';

                // 如果设备被选中，填充该设备的变量到变量选择框
                if (selectedDevice) {
                    selectedDevice.device_values.forEach(variable => {
                        // 只筛选出符合条件的变量：例如 int 或 float 类型，并且数据方向是接收（receive）或双向（both）
                        if (variable.data_direction === 'send') {

                            const option = document.createElement('option');  // 创建新的变量选项
                            option.value = variable.value_name;  // 变量名称作为选项的值
                            option.textContent = `${variable.value_name} (${variable.value_type})`;  // 变量名称和类型作为选项的文本
                            variableSelect.appendChild(option);  // 将变量选项添加到变量选择框中
                        }
                    });
                }
            });
        })
        .catch(error => {
            console.error('Error loading device list:', error);  // 捕获并显示错误信息
        });
}

function loadDevices3() {
    // 发送请求获取设备数据
    fetch('/get_device_list/')  // 获取设备列表的 API 路径
        .then(response => response.json())  // 解析 JSON 格式的数据
        .then(data => {
            const devices = data.devices;  // 从响应数据中获取设备列表
            const deviceSelect = document.getElementById('TimerScriptDeviceSelect');  // 获取设备选择框
            const variableSelect = document.getElementById('TimerScriptVariableSelect');  // 获取变量选择框

            // 清空现有设备和变量选择框的内容
            deviceSelect.innerHTML = '<option value="">Select Device</option>';
            variableSelect.innerHTML = '<option value="">Select Variable</option>';

            // 填充设备选择框
            devices.forEach(device => {
                const option = document.createElement('option');  // 创建新的选项
                option.value = device.device_name;  // 使用设备名称作为选项的值
                option.textContent = device.device_name;  // 设备名称作为选项的文本
                deviceSelect.appendChild(option);  // 将设备选项添加到设备选择框中
            });

            // 为设备选择框添加 change 事件监听器，动态加载变量
            deviceSelect.addEventListener('change', function() {
                const selectedDeviceName = this.value;  // 获取当前选择的设备名称
                const selectedDevice = devices.find(device => device.device_name === selectedDeviceName);  // 查找对应的设备

                // 清空变量选择框
                variableSelect.innerHTML = '<option value="">Select Variable</option>';

                // 如果设备被选中，填充该设备的变量到变量选择框
                if (selectedDevice) {
                    selectedDevice.device_values.forEach(variable => {
                        // 只筛选出符合条件的变量：例如 int 或 float 类型，并且数据方向是接收（receive）或双向（both）
                        if (variable.data_direction === 'send') {

                            const option = document.createElement('option');  // 创建新的变量选项
                            option.value = variable.value_name;  // 变量名称作为选项的值
                            option.textContent = `${variable.value_name} (${variable.value_type})`;  // 变量名称和类型作为选项的文本
                            variableSelect.appendChild(option);  // 将变量选项添加到变量选择框中
                        }
                    });
                }
            });
        })
        .catch(error => {
            console.error('Error loading device list:', error);  // 捕获并显示错误信息
        });
}

 function submitConditionScript() {
        const conditionDevice = document.getElementById('ConditionDeviceSelect').value;
        const conditionVariable = document.getElementById('ConditionVariableSelect').value;
        const conditionOperator = document.getElementById('ConditionVariable').value;
        const conditionValue = document.getElementById('ConditionValue').value;
        const performerDevice = document.getElementById('scriptDeviceSelect').value;
        const controlVariable = document.getElementById('scriptVariableSelect').value;
        const scriptValue = document.getElementById('ScriptValue').value;

        const data = {
            condition_device: conditionDevice,
            condition_variable: conditionVariable,
            condition_operator: conditionOperator,
            condition_value: conditionValue,
            performer_device: performerDevice,
            control_variable: controlVariable,
            script_value: scriptValue
        };

        fetch('/add_condition_script/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')  // CSRF Token
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            alert('Condition Script added successfully');
            console.log(data);
            fetchConditionScripts();
            loadTimerScripts();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error adding Condition Script');
        });


    }

    // 提交定时器脚本数据
    function submitTimerScript() {
        const timerType = document.getElementById('TimerType').value;
        const timerConditionValue = document.getElementById('TimerConditionValue').value;
        const performerDevice = document.getElementById('TimerScriptDeviceSelect').value;
        const controlVariable = document.getElementById('TimerScriptVariableSelect').value;
        const timerScriptValue = document.getElementById('TimerScriptValue').value;

        const data = {
            timer_type: timerType,
            timer_condition_value: timerConditionValue,
            performer_device: performerDevice,
            control_variable: controlVariable,
            timer_script_value: timerScriptValue
        };

        fetch('/add_timer_script/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')  // CSRF Token
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            alert('Timer Script added successfully');
            console.log(data);
            fetchConditionScripts();
            loadTimerScripts();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error adding Timer Script');
        });

    }

    // 获取 CSRF Token
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    document.addEventListener('DOMContentLoaded', function() {
    // 为所有的删除按钮绑定点击事件
    document.querySelectorAll('.deleteButton').forEach(button => {
        button.addEventListener('click', function() {
            var deviceId = this.getAttribute('data-device-id');  // 获取设备ID
            deleteTimerScript(deviceId);  // 调用删除函数
        });
    });
});

// 删除定时器脚本的函数
document.addEventListener('DOMContentLoaded', function() {
    // 页面加载完成后，获取设备数据
    fetchConditionScripts();
    loadTimerScripts();
});

// 获取设备数据并渲染到表格
function fetchConditionScripts() {
    fetch('/get_condition_scripts/')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('conditionScriptTableBody');
            tableBody.innerHTML = '';  // 清空当前表格内容


            data.condition_scripts.forEach(script => {
                const row = document.createElement('tr');
                row.id = `Script-Condition${script.device_id}`;

                row.innerHTML = `
                    <td> IF </td>
                    <td>${script.device_name}</td> <!-- 设备名称 -->
                    <td>${script.condition_variable}</td> <!-- 条件变量 -->
                    <td>${script.condition_operator}</td> <!-- 条件操作符 -->
                    <td>${script.condition_value}</td> <!-- 条件值 -->
                    <td> SO </td>
                    <td>${script.execute_device_name}</td> <!-- 执行设备 -->
                    <td>${script.execute_variable_name}</td> <!-- 执行变量 -->
                    <td>${script.execute_value}</td> <!-- 执行值 -->
                    <td>
                        <button type="button" class="deleteButton" data-device-id="Script-Condition${script.device_id}">Delete</button>
                    </td>
                `;

                // 将新行添加到表格
                tableBody.appendChild(row);

            });


            // 为所有的删除按钮绑定点击事件
            document.querySelectorAll('.deleteButton').forEach(button => {
                button.addEventListener('click', function() {
                    var deviceId = this.getAttribute('data-device-id').replace('Script-Condition', '');
                    deleteConditionScript(deviceId);  // 调用删除函数
                });
            });
        })
        .catch(error => {
            console.error('Error fetching condition scripts:', error);
        });
}

// 删除条件脚本的函数
function deleteConditionScript(deviceId) {
    fetch(`/delete_condition_script/${deviceId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),  // 确保包含 CSRF Token
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 删除成功后从 DOM 中移除相应的行
            document.getElementById(`Script-Condition${deviceId}`).remove();
            alert('Condition script deleted successfully!');
        } else {
            alert('Error: ' + data.error);  // 如果删除失败，显示错误消息
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting condition script');
    });
}
function loadTimerScripts() {
    fetch('/get_timer_scripts/')  // 请求获取所有定时器脚本
        .then(response => response.json())
        .then(data => {
            const timerScriptTable = document.getElementById("timerScriptTableBody");
            timerScriptTable.innerHTML = "";  // 清空现有数据

            data.timer_scripts.forEach(script => {
                const row = document.createElement("tr");
                row.id = `Timer-Condition${script.device_id}`;  // 设置每一行的 id 为 Timer-Condition + device_id

                row.innerHTML = `
                    <td> IF </td>
                    <td>${script.timer_type}</td>
                    <td>${script.timer_value}</td>
                    <td> SO </td>
                    <td>${script.execute_device_name}</td>
                    <td>${script.execute_variable_name}</td>
                    <td>${script.execute_device_value}</td>
                    <td>
                        <button type="button" class="deleteButton" data-device-id="${script.device_id}" onclick="deleteTimerScript(${script.device_id})">Delete</button>
                    </td>
                `;
                timerScriptTable.appendChild(row);  // 添加到表格中
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading timer scripts');
        });
}

// 删除定时器脚本
function deleteTimerScript(deviceId) {
    fetch(`/delete_timer_script/${deviceId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),  // 将 CSRF Token 添加到请求头
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 删除成功后从 DOM 中移除相应的行
            document.getElementById(`Timer-Condition${deviceId}`).remove();
            alert('Timer script deleted successfully!');
        } else {
            alert('Error: ' + data.error);  // 如果删除失败，显示错误消息
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting timer script');
    });
}