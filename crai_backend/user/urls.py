from django.urls import path, include
from .views import InfluencerListView

urlpatterns = [
    path("influencers/", InfluencerListView.as_view(), name="influencers"),
]