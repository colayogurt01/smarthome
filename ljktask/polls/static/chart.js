// WebSocket URL
const socket1 = new WebSocket('ws://localhost:8000/ws/chart_data/');

// 创建 WebSocket 连接

// 处理 WebSocket 打开连接
socket1.onopen = function(event) {
    console.log("WebSocket connection opened", event);
};

// 处理接收到的数据
socket1.onmessage = function(event) {
    try {
        const data = JSON.parse(event.data);  // 解析 JSON 数据
        const messageData = data.message;     // 获取从后端发送的数据

        console.log("Received data:", messageData);

        // 提取数据中的关键信息
        const deviceName = messageData.device_name;
        const valueName = messageData.value_name;
        const value = messageData[valueName];  // 获取对应变量的值

        console.log("deviceName:", deviceName);
        console.log("valueName:", valueName);
        console.log("value:", value);

        // 生成唯一标识符
        const uniqueId = `${deviceName}-${valueName}`;
        console.log("uniqueId:", uniqueId);

        // 更新页面元素的值
        const element = document.getElementById(uniqueId);
        if (element) {
            element.innerText = value;  // 更新页面上的值
        } else {
            console.log(`Element with ID ${uniqueId} not found.`);
        }

        // 查找并更新图表
        if (chartsMap[uniqueId]) {
            // 如果图表实例存在，更新图表数据
            updateChart(chartsMap[uniqueId], value);
        } else {
            console.log(`Chart with ID ${uniqueId} not found.`);
        }

    } catch (error) {
        console.error("Error parsing WebSocket message:", error);
    }
};

// 处理 WebSocket 错误
socket1.onerror = function(error) {
    console.error("WebSocket Error:", error);
};

// 处理 WebSocket 关闭
socket1.onclose = function(event) {
    console.log("WebSocket connection closed", event);
};
// 创建紫色到浅粉色的渐变
function createGradient(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(148, 0, 211, 1)');  // 起始紫色（紫罗兰色）
    gradient.addColorStop(1, 'rgba(255, 182, 193, 1)');  // 结束浅粉色
    return gradient;
}

// 更新图表的函数
function updateChart(chart, newValue) {
    const dataset = chart.data.datasets[0];  // 获取第一个数据集

    // 获取当前时间戳，格式化为时间字符串
    const currentTime = new Date().toLocaleTimeString();  // 获取当前时间，格式如 "12:34:56 PM"

    // 添加新的数据点和时间标签
    dataset.data.push(newValue);  // 添加新数据
    chart.data.labels.push(currentTime);  // 添加当前时间作为标签

    // 动态更新边框颜色为渐变色
    dataset.borderColor = createGradient(chart.ctx);  // 使用 `ctx` 来生成渐变颜色

    // 更新图表
    chart.update();
}






document.getElementById("three").addEventListener("change", function () {
        if (this.checked) {
            // 当选择 "BROKER" 时更新配置
            loadDevices();
        }
    });
document.getElementById('addButton').addEventListener('click', createChart);

// 获取设备列表并填充到下拉框中
    // 获取设备和变量列表的函数
let devicesMap = {}; // 用来存储设备ID与设备名称的映射关系
function loadDevices() {
    fetch('/get_device_list/')  // 获取设备列表的 API 路径
        .then(response => response.json())
        .then(data => {
            const devices = data.devices;

            // 清空现有设备和变量选择框的内容
            deviceSelect.innerHTML = '<option value="">Select Device</option>';
            variableSelect.innerHTML = '<option value="">Select Variable</option>';

            // 填充设备选择框
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.device_id;
                option.textContent = device.device_name;
                devicesMap[device.device_id] = device.device_name;
                deviceSelect.appendChild(option);
            });

            // 更新变量选择框
            deviceSelect.addEventListener('change', function() {
                const selectedDeviceId = this.value;
                const selectedDevice = devices.find(device => device.device_id == selectedDeviceId);

                // 清空变量选择框
                variableSelect.innerHTML = '<option value="">Select Variable</option>';

                // 填充变量选择框
               if (selectedDevice) {
                    selectedDevice.device_values.forEach(variable => {
                        // 仅筛选出符合条件的变量
                        if ((variable.value_type === 'int' || variable.value_type === 'float') &&
                            (variable.data_direction === 'receive' || variable.data_direction === 'both')) {

                            const option = document.createElement('option');
                            option.value = variable.value_name;
                            option.textContent = `${variable.value_name} (${variable.value_type})`;
                            variableSelect.appendChild(option);
                        }
                    });
                }
            });
        })
        .catch(error => console.error('Error loading device list:', error));
}


let chartsMap = {};

// 创建图表的函数
function createChart() {
    const deviceSelect = document.getElementById('deviceSelect');
    const variableSelect = document.getElementById('variableSelect');

    const selectedDeviceId = deviceSelect.value;
    const selectedVariable = variableSelect.value;
    const selectedDeviceName = devicesMap[selectedDeviceId];

    if (!selectedDeviceId || !selectedVariable) {
        alert('Please select a device and a variable');
        return;
    }

    // 创建图表容器
    const chartContainer = document.createElement('div');
    chartContainer.classList.add('chart-container');

    // 创建并添加删除按钮
    const closeButton = document.createElement('div');
    closeButton.classList.add('close-btn');
    closeButton.textContent = '×';
    closeButton.onclick = function () {
        chartContainer.remove();  // 删除该图表容器
        // 从 chartsMap 中移除该图表实例
        const chartId = `${selectedDeviceName}_${selectedVariable}`;
        delete chartsMap[chartId];
    };
    chartContainer.appendChild(closeButton);

    // 创建图表标题
    const title = document.createElement('h3');
    title.textContent = `Real-Time Line Chart for ${selectedDeviceName} \\ ${selectedVariable}`;
    chartContainer.appendChild(title);

    // 创建图表的 canvas 元素，并设置 id 为设备名+变量名
    const canvas = document.createElement('canvas');
    const chartId = `${selectedDeviceName}-${selectedVariable}`;  // 组合设备名和变量名作为 id
    canvas.id = chartId;  // 设置 canvas 的 id

    chartContainer.appendChild(canvas);

    // 将图表容器添加到页面的 charts-container 中
    document.getElementById('charts-container').appendChild(chartContainer);

    // 获取 canvas 元素
    const ctx = canvas.getContext('2d');

    // 创建 Chart.js 实例
    const chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: selectedVariable,  // 数据集标签
                borderColor: 'rgba(138, 43, 226, 1)',  // 紫色边框
                backgroundColor: 'rgba(255, 105, 180, 0.2)',  // 粉色渐变背景
                fill: true,  // 是否填充图表背景
                tension: 0.1
            }]
        },
         options: {
            responsive: true,
            aspectRatio: 3.5,  // 设置宽高比为 1.5:1
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,  // 设置图例标签字体大小
                            color: 'rgba(0, 0, 0, 0.7)'  // 设置图例标签颜色
                        },
                        // 自定义图例的标记形状为圆形
                        generateLabels: function(chart) {
                            const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                            labels.forEach(function(label) {
                                label.pointStyle = 'circle';  // 设置标记为圆形
                            });
                            return labels;
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                        }
                    },
                    titleFont: {
                        size: 16,  // 设置 tooltip 标题字体大小
                        color: 'rgba(255, 99, 132, 1)'  // 设置 tooltip 标题颜色
                    },
                    bodyFont: {
                        size: 14,  // 设置 tooltip 正文字体大小
                        color: 'rgba(0, 0, 0, 0.8)'  // 设置 tooltip 正文字体颜色
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        font: {
                            size: 16,  // 设置 x 轴标题字体大小
                            color: 'rgba(0, 0, 0, 1)'  // 设置 x 轴标题颜色
                        }
                    },
                    ticks: {
                        font: {
                            size: 12,  // 设置 x 轴坐标点字体大小
                            color: 'rgba(0, 0, 0, 1)'  // 设置 x 轴坐标点字体颜色
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        font: {
                            size: 16,  // 设置 y 轴标题字体大小
                            color: 'rgba(0, 0, 0, 1)'  // 设置 y 轴标题颜色
                        }
                    },
                    ticks: {
                        font: {
                            size: 12,  // 设置 y 轴坐标点字体大小
                            color: 'rgba(0, 0, 0, 1)'  // 设置 y 轴坐标点字体颜色
                        }
                    }
                }
            }
        }
    });


    // 将图表实例存储在 chartsMap 中，便于后续更新
    chartsMap[chartId] = chartInstance;
}
