document.addEventListener('DOMContentLoaded', function() {
    // 监听 "设备控制" radio 按钮的 change 事件
    document.getElementById("one").addEventListener("change", function() {
        if (this.checked) {
            // 当该 radio 按钮被选中时，触发刷新操作
            fetchData();  // 调用刷新页面的函数
        }
    });

    // 刷新页面的函数
    function refreshPage() {
        // 你可以选择重新加载页面，或者重新获取数据并更新页面
        // 例如重新加载页面
        location.reload();  // 刷新页面

        // 或者触发数据获取和更新操作
        fetchData();  // 如果你想仅仅更新内容而不完全刷新页面，可以使用这个方法
    }

    // 如果你不想刷新整个页面，而只更新内容，可以使用以下方法获取数据并更新页面：
function fetchData() {
    fetch('/get_device_list/')  // 获取设备列表的API
        .then(response => response.json())
        .then(data => {
            const devices = data.devices;
            const cardsContainer = document.querySelector('#device-cards');
            cardsContainer.innerHTML = '';  // 清空原有卡片

            // 遍历所有设备
            devices.forEach(device => {
                // 检查设备是否有有效的 device_values
                if (device.device_values && Array.isArray(device.device_values)) {
                    // 遍历该设备的所有变量
                    device.device_values.forEach(variable => {
                        let cardHTML = '';

                        // 判断并生成对应类型的卡片
                        if (variable.value_type === 'bool' && variable.data_direction === 'send') {
                            console.log('Found bool variable:', variable.value_name);
                            cardHTML = createSendCard(device.device_name, variable.value_name);
                        } else if ((variable.value_type === 'int' || variable.value_type === 'float') &&
                                   (variable.data_direction === 'send' || variable.data_direction === 'both')) {
                            cardHTML = createValueCard(device.device_name, variable.value_name);
                        } else if (variable.data_direction === 'receive') {
                            cardHTML = createReceiveCard(device.device_name, variable.value_name);
                        }

                        // 将生成的卡片 HTML 添加到页面
                        cardsContainer.innerHTML += cardHTML;
                    });
                } else {
                    console.warn('Device has no valid values:', device.device_name);
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}


    // 创建发送类型的卡片
    function createSendCard(deviceName, valueName) {
        return `
            <div class="container">
                <div class="box">
                    <div class="device name">
                        <span class="card_title">${deviceName}</span>
                    </div>
                    <hr class="line" />
                    <div>
                        <div class="icon">
                            <input id="checkbox" type="checkbox" />
                            <label class="switch" for="checkbox">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="slider">
                                    <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"></path>
                                </svg>
                            </label>
                        </div>
                        <div class="val">
                            <span>${valueName}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 创建接收类型的卡片
    function createReceiveCard(deviceName, valueName) {
        return `
            <div class="container">
                <div class="box">
                    <div class="device name">
                        <span class="card_title">${deviceName}</span>
                    </div>
                    <hr class="line" />
                    <div>
                        <div class="icon"></div>
                        <div class="val">
                            <span>${valueName}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 创建值卡片（int、float）
    function createValueCard(deviceName, valueName) {
        return `
            <div class="container">
                <div class="box">
                    <div class="device name">
                        <span class="card_title">${deviceName}</span>
                    </div>
                    <hr class="line" />
                    <div>
                        <div class="input-wrapper">
                            <input type="text" name="text" class="input" placeholder="Enter Val" />
                            <button class="Subscribe-btn">Set</button>
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
