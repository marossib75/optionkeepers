from django.urls import path, re_path
from .views import *
from rest_framework.authtoken import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('', index, name='index'),
    path('signin/', signin, name='signin'),
    path('signup/', signup, name='signup'),
    path('privacy/', privacy, name='privacy'),
    path('api/signout/', signout, name='signout'),

    # mobile
    path('api-token-auth/', csrf_exempt(views.obtain_auth_token), name='api-token-auth'),
    
    # for all react path
    re_path(r'^app/', app, name='app'),
]
