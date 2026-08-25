from django.urls import path
from .views import InfluencerDiscoveryView, InfluencerListView, InfluencerProfileView, InfluencerFollowView, InfluencerFollowToggleView, InfluencerSubscribersView, InfluencerAnalyticsView

urlpatterns = [
    path("influencer/discovery", InfluencerDiscoveryView.as_view(), name="influencer_discovery"),
    path("influencers/", InfluencerListView.as_view(), name="influencer-list"),
    path("influencers/<str:username>/", InfluencerProfileView.as_view(), name="influencer-profile"),
    path("influencers/<str:username>/follow/", InfluencerFollowView.as_view(), name="influencer-follow"),
    path("influencers/<str:username>/follow/toggle/", InfluencerFollowToggleView.as_view(), name="influencer-follow-toggle"),
    path("subscribers/", InfluencerSubscribersView.as_view(), name="influencer-subscribers"),
    path("analytics/", InfluencerAnalyticsView.as_view(), name="influencer-analytics"),
]
