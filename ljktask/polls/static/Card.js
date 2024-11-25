

const socket = new WebSocket('ws://localhost:8000/ws/device_data/');

// 连接成功后发送消息
socket.onopen = function(event) {
    console.log("Connected to WebSocket!");
};

// 接收后端推送的数据
socket.onmessage = function(event) {
    try {
        const data = JSON.parse(event.data);  // 解析 JSON 数据
        // console.log("Received data from backend:", data);
        const message=data.message;

        const deviceName = message.device_name;
        const valueName = message.value_name;
        const value = message[valueName];  // 获取对应变量的值

        // console.log("deviceName:", deviceName);
        // console.log("valueName:", valueName);
        // console.log("value:", value);

        // 获取对应的 uniqueId，根据 deviceName 和 value_name 生成
        const uniqueId = `${deviceName}-${valueName}`;
        // console.log("uniqueId:", uniqueId);

        // 查找页面上的元素并更新值
        const element = document.getElementById(uniqueId);

        // 如果找到了对应的元素，更新其值
        if (element) {
            element.innerText = value;  // 更新页面上的值
        } else {
            console.log(`Element with ID ${uniqueId} not found.`);  // 如果没有找到元素，输出警告
        }
    } catch (error) {
        console.error("Error parsing WebSocket message:", error);
    }
};



// 连接关闭
socket.onclose = function(event) {
    console.log("WebSocket closed");
};


document.addEventListener('DOMContentLoaded', function () {
    // 监听 "设备控制" 标签页的变化（radio input 状态变化）
    $('input[id="one"]').on('change', function() {
        if ($(this).is(':checked')) {
            fetchCardData();  // 更新设备列表
        }
    });

    // 获取数据并更新页面
    function fetchCardData() {
        fetch('/get_device_list/')  // 获取设备列表的API
            .then(response => response.json())
            .then(data => {
                const devices = data.devices;
                const cardsContainer = document.querySelector('#device-cards');
                cardsContainer.innerHTML = '';  // 清空原有卡片

                devices.forEach(device => {
                    if (device.device_values && Array.isArray(device.device_values)) {
                        let allVariables = [];

                        // 过滤接收类型且 value_type 为 int 或 float 的变量
                        device.device_values.forEach(variable => {
                            if (variable.data_direction === 'receive' &&
                                (variable.value_type === 'int' || variable.value_type === 'float')) {
                                allVariables.push(variable);
                            }
                        });

                        // 每 3 个变量创建一个新的卡片
                        const chunkedVariables = chunkVariables(allVariables, 3);

                        chunkedVariables.forEach((chunk) => {
                            let cardHTML = createReceiveCard(device.device_name, chunk, device.device_id);
                            cardsContainer.innerHTML += cardHTML; // 添加卡片到页面
                        });

                        // 处理其他类型的变量（send、int、float等）
                        device.device_values.forEach(variable => {
                            if ((variable.value_type === 'int' || variable.value_type === 'float') &&
                                (variable.data_direction === 'send' || variable.data_direction === 'both')) {
                                let cardHTML = createValueCard(device.device_name, variable.value_name, device.device_id);
                                cardsContainer.innerHTML += cardHTML;
                            } else if (variable.value_type === 'bool' && variable.data_direction === 'send') {
                                let cardHTML = createSendCard(device.device_name, variable.value_name, device.device_id);
                                cardsContainer.innerHTML += cardHTML;

                            }
                        });

                    } else {
                        console.warn('Device has no valid values:', device.device_name);
                    }
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // 切割变量数组，每个数组最多有 3 个元素
    function chunkVariables(variables, size) {
        const result = [];
        for (let i = 0; i < variables.length; i += size) {
            result.push(variables.slice(i, i + size));
        }
        return result;
    }

    // 创建接收类型的卡片
function createReceiveCard(deviceName, variables, deviceId) {
    let cardHTML = `
        <div class="container">
            <div class="box">
                <div class="device name">
                    <span class="card_title">${deviceName}</span>
                </div>
                <hr class="line" />
                <div>
                    <div class="icon"></div>
                    <div class="val">
    `;

    // 遍历当前卡片要显示的变量
    variables.forEach(variable => {
        // 直接使用 deviceName 作为唯一标识符
        const uniqueId = `${deviceName}-${variable.value_name}`;
        cardHTML += `
            <table class="variable-table">
                <tr><td>${variable.value_name}</td><td id="${uniqueId}">waiting...</td></tr>
            </table>
        `;
    });

    cardHTML += `
                    </div>
                </div>
            </div>
        </div>
    `;

    return cardHTML;
}


    // 发送（int、float）卡片
    function createValueCard(deviceName, valueName, deviceId) {
        const uniqueId = `${deviceId}-${valueName}`;
        console.log(`uniqueId: ${uniqueId}`)
        console.log(`设备名称: ${deviceName}, 变量名: ${valueName}`);
        return `
            <div class="container">
                <div class="box">
                    <div class="device name">
                        <span class="card_title">${deviceName}</span>
                    </div>
                    <hr class="line" />
                    <div>
                        <div class="val">
                            <table class="variable-table">
                                <tr>
                                    <td>${valueName}</td>
                                </tr>
                                <tr>
                                    <td id="${uniqueId}"></td>
                                </tr>
                            </table>
                        </div>
                        <div class="input-wrapper">
                            <input type="text" name="text" class="input" id="${uniqueId}" placeholder="Enter Val" />
                            <button class="Subscribe-btn" >Set</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 开关类型的卡片
 // 开关类型的卡片
function createSendCard(deviceName, valueName, deviceId) {
    const uniqueId = `${deviceId}-${valueName}`;
    console.log(`uniqueId: ${uniqueId}`);
    console.log(`设备名称: ${deviceName}, 变量名: ${valueName}`);

    const cardHtml = `
        <div class="container">
            <div class="box">
                <div class="device name">
                    <span class="card_title">${deviceName}</span>
                </div>
                <hr class="line" />
                <div class="icon">
                       <label class="container1">
                          <input type="checkbox" id="${uniqueId}" data-device-id="${deviceId}" data-value-name="${valueName}">
                          <div class="checkmark1">
                            <svg xml:space="preserve" viewBox="0 0 49.548 49.549" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="Capa_1" version="1.1">
                        <g>
                            <g>
                                <g>
                                    <path d="M30.203,4.387v4.385c7.653,2.332,13.238,9.451,13.238,17.857c0,10.293-8.373,18.667-18.667,18.667
                                        S6.106,36.922,6.106,26.629c0-8.405,5.585-15.525,13.238-17.857V4.387C9.323,6.835,1.855,15.866,1.855,26.629
                                        c0,12.639,10.281,22.92,22.919,22.92s22.92-10.281,22.92-22.92C47.694,15.865,40.224,6.835,30.203,4.387z"></path>
                                </g>
                                <g>
                                    <path d="M24.776,27.225c-1.41,0-2.554-1.145-2.554-2.555V2.554c0-1.41,1.144-2.554,2.554-2.554c1.41,0,2.554,1.144,2.554,2.554
                                        V24.67C27.33,26.08,26.186,27.225,24.776,27.225z"></path>
                                </g>
                            </g>
                        </g>
                        </svg>
                          </div>
                        </label>
                    <div class="val">
                        <span>${valueName}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    /* From Uiverse.io by aadium */

    // 返回渲染好的 HTML 代码
    return cardHtml;
}


});



document.addEventListener('DOMContentLoaded', function () {
    // 监听按钮点击事件
    document.querySelector('#device-cards').addEventListener('click', function (event) {
        // 检查点击的是否是按钮（Set按钮）
        if (event.target && event.target.classList.contains('Subscribe-btn')) {
            // 获取按钮所在的卡片
            const card = event.target.closest('.box');

            // 从卡片中提取 uniqueId
            const input = card.querySelector('.input');  // 获取对应卡片内的 input 元素
            const uniqueId = input.id;  // 获取该 input 的 id（即 uniqueId）

            console.log(`uniqueId: ${uniqueId}`);
            const [deviceId, valueName] = uniqueId.split('-');  // 使用 '-' 分割成 deviceId 和 valueName

            // 获取输入框的值
            const inputValue = input.value;  // 从 input 获取值
            console.log(`Device ID: ${deviceId}, Variable Name: ${valueName}, Input Value: ${inputValue}`);

            // 调用函数来处理这个按钮的操作
            handleButtonClick(deviceId, valueName, inputValue);
        }
    });

    // 按钮点击时的处理函数
    function handleButtonClick(deviceId, valueName, inputValue) {
        if (inputValue) {
            console.log(`Sending data to server: Device ID: ${deviceId}, Value Name: ${valueName}, Input Value: ${inputValue}`);

            // 发送请求到后端
            fetch('/set_device_value/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deviceId: deviceId,  // 使用设备 ID
                    valueName: valueName,  // 使用变量名
                    value: inputValue,  // 使用输入的值
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Device value updated successfully');
                } else {
                    console.error('Failed to update device value');
                }
            })
            .catch(error => {
                console.error('Error updating value:', error);
                alert('Error updating value');
            });
        } else {
            alert('Please enter a value');
        }
    }



  document.querySelector('#device-cards').addEventListener('change', function(event) {
    // 检查点击的是否是复选框（checkbox）
    if (event.target && event.target.type === 'checkbox') {
        const checkbox = event.target;

        // 从复选框中提取设备 ID 和变量名称
        const deviceId = checkbox.getAttribute('data-device-id');
        const valueName = checkbox.getAttribute('data-value-name');

        // 获取勾选状态
        const isChecked = checkbox.checked;

        console.log(`Setting value for device ${deviceId}, variable ${valueName} to ${isChecked}`);

        // 发送更新请求到后端
        fetch('/set_device_value/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceId: deviceId,  // 使用设备 ID
                valueName: valueName,  // 使用变量名
                value: isChecked,  // 使用勾选状态（true/false）
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Device value updated');
            } else {
                console.error('Failed to update device value');
            }
        })
        .catch(error => console.error('Error:', error));
    }
});



});
