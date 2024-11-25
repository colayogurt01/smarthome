from django.apps import AppConfig


class PollsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'polls'

    # def ready(self):
    #     # 导入定时器启动函数
    #     from .Script import start_all_timers
    #     # 在 Django 启动时运行定时器
    #     start_all_timers()
