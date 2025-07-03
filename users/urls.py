from django.urls import path
from .views import *

urlpatterns = [
    path('', user),
    path('search/', users),
    path('search/share/strategy/', share_strategy_to_users),


    path('portfolio/', portfolio),


    path('strategies/', strategies),
    path('strategies/explore/', public_strategies),
    path('strategies/saved/', saved_strategies),
    path('strategies/history/', opened_strategies),
    path('strategies/share/', share_strategies),
    path('strategies/mypublic/', my_public_strategies),
    path('strategies/<str:id>/', strategy),
    path('strategies/<str:id>/profit/', strategy_profit),
    path('strategies/<str:id>/greeks/', strategy_greeks),
    path('strategies/<str:id>/upvote/', strategy_upvote),
    path('strategies/<str:id>/bookmark/', strategy_bookmark),


    path('clubs/', clubs),
    path('clubs/names/', my_club_names),
    path('clubs/joined/', joined_clubs),
    path('clubs/explore/', public_clubs),
    path('clubs/admin/administrate/', clubs_of_admin),
    path('clubs/<str:id>/', club),
    path('clubs/<str:id>/upvote/', club_upvote),
    path('clubs/<str:id>/member/<str:username>/', club_member),
    path('clubs/<str:id>/admin/<str:username>/', club_admin),
    path('clubs/<str:id>/strategies/<str:strategyId>/', club_strategy),
    path('clubs/<str:creator_userId>/<str:name>/', club_page),
]