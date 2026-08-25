from django.urls import path
from .views import *

urlpatterns = [
    path("createcharge/", create_charge),
    path("updatecharge/", update_charge),
    path("webhook/", tap_webhook),
    path('order/', OrderListView.as_view()),
    path('order/<int:pk>', OrderRetrieveView.as_view()),
    path('mycontent/', MyContentAPIView.as_view()),
    path('statics/', statics),
    path("clientdashboard/", ClientDashboardView.as_view(), name="client-dashboard"),
]
