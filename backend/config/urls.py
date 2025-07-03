"""finance URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from django.contrib.auth import views as auth_views

from rest_framework.permissions import AllowAny
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    re_path(r'^.*$', TemplateView.as_view(template_name="index.html")),
    path('admin/', admin.site.urls),
    path('', include('home.urls')),
    path('api/users/', include('users.urls')),
    path('api/chains/', include('chains.urls')),
    path('api/markets/', include('markets.urls')),
    path('api/utils/', include('utils.urls')),
    path('captcha/', include('captcha.urls')),
    path("api/", include("api.urls")),

    re_path(r'^.*$', TemplateView.as_view(template_name="index.html")),
    # re_path(r'^accounts/pwd-change/$', auth_views.PasswordChangeView.as_view(template_name='user/pwd-change.html'), name='pwd-change'),
    # re_path(r'^accounts/pwd-change/done/$', auth_views.PasswordChangeDoneView.as_view(template_name='user/pwd-change-done.html'), name='pwd-change-done'),
    # re_path(r'^accounts/pwd-reset/$', auth_views.PasswordResetView.as_view(template_name='user/pwd-reset.html'), name='pwd-reset'),
    # re_path(r'^accounts/pwd-reset/done/$', auth_views.PasswordResetDoneView.as_view(template_name='user/pwd-reset-done.html'), name='pwd-reset-done'),
    # path('accounts/pwd-reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='user/pwd-reset-confirm.html'), name='pwd-reset-confirm'),
    # re_path(r'^accounts/pwd-reset/complete/$', auth_views.PasswordResetCompleteView.as_view(template_name='user/pwd-reset-complete.html'), name='pwd-reset-complete'),
    # path('loginas/', include('utils.urls')),
    # re_path(r'^forbidden/$', permission_denied),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)