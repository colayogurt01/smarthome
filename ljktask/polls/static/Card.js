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
            const uniqueId = `${deviceId}-${variable.value_name}`;
            cardHTML += `
                <table class="variable-table">
                    <tr><td>${variable.value_name}</td><td id="${uniqueId}">待更新...</td></tr>
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
                        <div class="icon">
                            <label class="switch" for="${uniqueId}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="slider">
                                    <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"></path>
                                </svg>
                            </label>
                        <input id="${uniqueId}" type="checkbox" data-device-id="${deviceId}" data-value-name="${valueName}" class="hidden-checkbox" style="display: none;"/>

                        </div>
                        <div class="val">
                            <span>${valueName}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
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
