// 添加设备数据变量行
function addDeviceVariable() {
    // 获取表格的 tbody 部分
    const table = document.getElementById("deviceVariableTable");

    // 创建新行
    const newRow = document.createElement("tr");

    // 设置新行的内容
    newRow.innerHTML = `
        <td>ValueName:</td>
        <td><input type="text" name="deviceValueName[]" required></td>
        <td>
            <select name="deviceValueType[]" required>
                <option value="int">int</option>
                <option value="float">float</option>
                <option value="bool">bool</option>
            </select>
        </td>
        <td>
            <select name="data_direction[]" required>
                <option value="receive">Receive</option>
                <option value="send">Send</option>
                <option value="both">Both</option>
            </select>
        </td>
        <td>
            <button type="button" onclick="delectDeviceVariable(this)">delect</button>
        </td>
    `;

    // 将新行添加到表格中
    table.appendChild(newRow);
}

// 删除设备数据变量行
function delectDeviceVariable(button) {
    // 获取当前按钮所在的行
    const row = button.closest("tr");

    // 删除该行
    row.remove();
}

// 获取文本框数据并发送到服务器的函数
function submitForm() {
    // 获取设备名称和主题
    let deviceName = document.querySelector('input[name="deviceName"]').value;
    let deviceTopic = document.querySelector('input[name="deviceTopic"]').value;

    // 获取所有的设备数据变量名称（name）
    let deviceValueNames = [];
    let valueNameInputs = document.querySelectorAll('input[name="deviceValueName[]"]');
    valueNameInputs.forEach(input => {
        deviceValueNames.push(input.value);
    });

    // 获取所有的设备数据类型（type）
    let deviceValueTypes = [];
    let valueTypeSelects = document.querySelectorAll('select[name="deviceValueType[]"]');
    valueTypeSelects.forEach(select => {
        deviceValueTypes.push(select.value);
    });

    // 获取所有的数据方向（data_direction）
    let deviceDataDirections = [];
    let dataDirectionsSelects = document.querySelectorAll('select[name="data_direction[]"]');
    dataDirectionsSelects.forEach(select => {
        deviceDataDirections.push(select.value);  // 获取数据方向
    });


    // 整理数据为一个 JSON 对象
    let formData = {
        deviceName: deviceName,
        deviceTopic: deviceTopic,
        deviceVariables: []
    };

    // 将数据变量名称、类型和数据方向按顺序配对
    for (let i = 0; i < deviceValueNames.length; i++) {
        formData.deviceVariables.push({
            valueName: deviceValueNames[i],
            valueType: deviceValueTypes[i],
            dataDirection: deviceDataDirections[i]  // 获取数据方向
        });
    }

    // 输出整理后的 JSON 数据
    console.log(JSON.stringify(formData));

    // 发送数据到服务器 (可以使用 AJAX)
    sendDataToServer(formData);
}

// 发送数据到服务器
function sendDataToServer(data) {
    const csrfToken = document.querySelector('[name=csrf-token]').content;
    fetch('/add-device/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken  // 将 CSRF token 添加到请求头
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
