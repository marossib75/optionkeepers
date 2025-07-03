from django.urls import path
from .views import *

urlpatterns = [
    path('run-tasks/', run_tasks, name='run-tasks'),
    path('groups/', groups),
    path('exchanges/', excnanges)
]
