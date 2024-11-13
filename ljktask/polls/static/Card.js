document.addEventListener('DOMContentLoaded', function () {
    // 监听 "设备控制" radio 按钮的 change 事件
    document.getElementById("one").addEventListener("change", function () {
        if (this.checked) {
            // 当该 radio 按钮被选中时，触发刷新操作
            fetchData();  // 调用刷新页面的函数
        }
    });

    // 获取数据并更新页面
    function fetchData() {
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
                            let cardHTML = createReceiveCard(device.device_name, chunk);
                            cardsContainer.innerHTML += cardHTML; // 添加卡片到页面
                        });

                        // 处理其他类型的变量（send、int、float等）
                        device.device_values.forEach(variable => {
                            if ((variable.value_type === 'int' || variable.value_type === 'float') &&
                                (variable.data_direction === 'send' || variable.data_direction === 'both')) {
                                let cardHTML = createValueCard(device.device_name, variable.value_name);
                                cardsContainer.innerHTML += cardHTML;
                            } else if (variable.value_type === 'bool' && variable.data_direction === 'send') {
                                let cardHTML = createSendCard(device.device_name, [variable]); // 单个接收变量
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
    function createReceiveCard(deviceName, variables) {
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
            cardHTML += `
                <table class="variable-table">
                    <tr><td>${variable.value_name}</td><td>待更新...</td></tr>
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
                        <div class="val">
                            <table class="variable-table">
                                <tr>
                                    <td>变量名</td>
                                    <td>${valueName}</td>
                                </tr>
                                <tr>
                                    <td>当前值</td>
                                    <td>待更新...</td>
                                </tr>
                            </table>
                        </div>
                        <div class="input-wrapper">
                            <input type="text" name="text" class="input" placeholder="Enter Val" />
                            <button class="Subscribe-btn">Set</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
});
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
                    <div class="val">
                        <span>${valueName}</span>
                    </div>
                    </div>

                </div>
            </div>
        </div>
    `;
}
