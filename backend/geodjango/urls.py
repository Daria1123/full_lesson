from django.urls import path

from .views import *

urlpatterns = [
    path('aimag/',  AimagApiView.as_view()),
]