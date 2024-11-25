

// 设置 AJAX 请求的默认行为
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken')); // 获取 CSRF 令牌
        }
    }
});

// 获取 CSRF 令牌的函数
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue; // 返回 CSRF 令牌
}

// 处理登录表单提交
$('#loginForm').on('submit', function(event) {
    event.preventDefault(); // 阻止默认提交行为

    // 获取用户名和密码
    const username = $('input[name="username"]').val();
    const password = $('input[name="password"]').val();

    // 发送 AJAX 请求
    $.ajax({
        type: 'POST',
        url: '{% url "login_view" %}',  // 登录视图的 URL
        data: {
            username: username,
            password: password // 直接发送明文密码
        },
        success: function(response) {
            if (response.redirect_url) {
                window.location.href = response.redirect_url; // 登录成功，重定向
            } else {
                alert('登录失败：' + response.error); // 显示错误提示
            }
        },
        error: function(xhr) {
            alert('登录请求失败：' + xhr.responseText); // 处理错误
        }
    });
});
