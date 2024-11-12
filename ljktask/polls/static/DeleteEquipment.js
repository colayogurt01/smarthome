function updateDeviceList() {
    $.ajax({
        url: '/get_device_list/',  // 获取最新的设备列表
        method: 'GET',
        success: function(response) {
            var devices = response.devices;  // 获取设备数据
            var tableBody = $('#device-table tbody');
            tableBody.empty();  // 清空当前表格内容

            // 重新生成表格内容
            devices.forEach(function(device) {
                var row = $('<tr>').attr('id', 'device-' + device.device_id);
                row.append('<td>' + device.device_name + '</td>');  // 设备名称
                row.append('<td>' + device.device_client_id + '</td>');  // 设备客户端 ID
                row.append('<td>' + device.device_topic + '</td>');  // 设备主题

                // 设备变量
                var variablesHtml = '';
                device.device_values.forEach(function(value) {
                    variablesHtml += value.value_type + ': '+value.data_direction+':' + value.value_name + '<br>';  // 显示设备变量
                });
                row.append('<td>' + variablesHtml + '</td>');  // 设备变量列

                // 添加删除按钮列
                row.append('<td><button class="delete-btn" data-device-id="' + device.device_id + '">Delete</button></td>');
                tableBody.append(row);  // 将生成的行添加到表格中
            });

            // 重新绑定删除按钮的事件
            bindDeleteButton();
        },
        error: function(xhr, status, error) {
            alert('Error fetching device list: ' + error);  // 请求失败时弹出错误信息
        }
    });
}

// 绑定删除按钮的点击事件
function bindDeleteButton() {
    $('.delete-btn').on('click', function() {
        var deviceId = $(this).data('device-id');  // 获取设备 ID

        // 发送 AJAX 请求删除设备
        $.ajax({
            url: '/delete_device/' + deviceId + '/',  // 后端删除设备的 URL
            method: 'DELETE',
            success: function(response) {
                alert(response.message);  // 显示删除成功的消息
                // 删除设备所在的行
                $('#device-' + deviceId).remove();
            },
            error: function(xhr, status, error) {
                alert('Error deleting device: ' + error);  // 删除失败的提示
            }
        });
    });
}
updateDeviceList();

// 只有当标签被选中时才更新
$('input[id="five"]').on('change', function() {
    if ($(this).is(':checked')) {
        updateDeviceList();  // 更新设备列表
    }
});

