from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContentViewSet,
    FollowingContentView,
    upload_media,
    toggle_like,
    content_comments,
    comment_detail,
    share_content,
)

router = DefaultRouter()
router.register(r"contents", ContentViewSet, basename="content")

urlpatterns = [
    path("", include(router.urls)),
    path("following-contents/", FollowingContentView.as_view(), name="following-contents"),
    path("media/upload/", upload_media, name="media-upload"),
    path("contents/<int:pk>/like/", toggle_like, name="content-like"),
    path("contents/<int:pk>/comments/", content_comments, name="content-comments"),
    path("comments/<int:pk>/", comment_detail, name="comment-detail"),
    path("contents/<int:pk>/share/", share_content, name="content-share"),
]
