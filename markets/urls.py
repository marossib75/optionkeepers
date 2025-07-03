from django.urls import path
from .views import *

urlpatterns = [
   path('', get_markets),
   path('<str:symbol>/', get_market),
   path('<str:symbol>/futures/', get_market_futures),
   path('<str:symbol>/volatility/', get_market_volatility),
   path('<str:symbol>/open-interest/', get_market_open_interest),
   path('<str:symbol>/history/', get_market_history),
   path('<str:symbol>/history/volatility/', get_market_history_volatility),

   # mobile
   path('paginated/<str:mrkt>/<int:skip>/<int:limit>/', get_markets_paginated),
   path('count/<str:mrkt>/', get_count_market_elements),
   path('search/<str:s>/<str:mrkt>/', get_markets_search),
]