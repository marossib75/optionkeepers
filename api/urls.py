from django.urls import path
from .views import strategie_view

urlpatterns = [
    path("strategie/", strategie_view),
]
