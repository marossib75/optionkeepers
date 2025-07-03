from django.urls import path

from .views import *

urlpatterns = [
    path('<str:symbol>/', chain),
    path('<str:symbol>/<str:expiration>/<str:date>/', chain),
    path('<str:symbol>/<str:expiration>/<str:date>/volatility/variation/', get_volatility_variation),
    path('<str:symbol>/<str:expiration>/<str:date>/open-interest/', get_open_interest),
    path('<str:symbol>/<str:expiration>/<str:date>/open-interest/cumulative/', get_open_interest_cumulative),
]
