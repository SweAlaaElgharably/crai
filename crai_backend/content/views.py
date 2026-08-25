import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
from django.utils import timezone
from payment.models import Enrollment
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from .models import Content, Like, Comment
from .serializers import ContentSerializer, CommentSerializer
from .permissions import ContentPermission
from django.db.models import Q, F
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .serializers import FollowingContentSerializer
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models import User

# Create your views here.

def _has_content_access(user, content):
    """Free content: any authenticated user. Paid content: active enrollment (or owner/staff)."""
    if not content.is_published:
        return False
    if content.is_free:
        return True
    return (Enrollment.objects.filter(user=user, content=content)
        .filter(Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now()))
        .exists())


def _can_interact(user, content):
    if not user.is_authenticated:
        return False
    if user.is_staff or content.owner_id == user.id:
        return True
    return _has_content_access(user, content)
class ContentViewSet(ModelViewSet):
    serializer_class = ContentSerializer
    permission_classes = [ContentPermission]
    def get_queryset(self):
        user = self.request.user
        Content.publish_due()
        if user.is_staff:
            return Content.objects.select_related("owner", "category").all()
        if self.action == "list":
            return (Content.objects.select_related("owner", "category")
                .filter(owner=user)
                .order_by("-created_at", "-id"))
        return Content.objects.select_related("owner", "category").all()
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_staff or instance.owner_id == request.user.id:
            return Response(self.get_serializer(instance).data)
        active_enrollment = None
        if not instance.is_free:
            active_enrollment = (Enrollment.objects.filter(user=request.user, content=instance)
                .filter(Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now()))
                .first())
        has_access = instance.status == Content.Status.PUBLISHED and (instance.is_free or active_enrollment is not None)
        data = self.get_serializer(instance).data
        if not has_access:
            data["body"] = None
        data["has_access"] = has_access
        if active_enrollment and active_enrollment.expires_at:
            data["access_expires_at"] = active_enrollment.expires_at
        return Response(data)


MEDIA_RULES = {
    "image": {"extensions": ["jpg", "jpeg", "png", "webp", "gif"], "max_mb": 10},
    "video": {"extensions": ["mp4", "webm", "mov", "m4v", "avi", "mkv"], "max_mb": 200},
    "pdf": {"extensions": ["pdf"], "max_mb": 30},
}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_media(request):
    if request.user.user_type != User.UserType.INFLUENCER and not request.user.is_staff:
        return Response({"detail": "Only influencers can upload media."}, status=403)

    file = request.FILES.get("file")
    if not file:
        return Response({"detail": "No file provided. Send multipart/form-data with a 'file' field."}, status=400)

    extension = os.path.splitext(file.name)[1].lower().lstrip(".")
    kind = next((name for name, rule in MEDIA_RULES.items() if extension in rule["extensions"]), None)
    if not kind:
        allowed = sorted({ext for rule in MEDIA_RULES.values() for ext in rule["extensions"]})
        return Response({"detail": f"Unsupported file type '.{extension}'. Allowed: {', '.join(allowed)}."}, status=400)

    max_bytes = MEDIA_RULES[kind]["max_mb"] * 1024 * 1024
    if file.size > max_bytes:
        return Response({"detail": f"File too large ({file.size} bytes). Max {MEDIA_RULES[kind]['max_mb']}MB for {kind}s."}, status=400)

    filename = f"{uuid.uuid4().hex}.{extension}"
    path = default_storage.save(f"uploads/{kind}s/{filename}", file)
    url = request.build_absolute_uri(settings.MEDIA_URL + path)
    return Response({"url": url, "path": path, "name": file.name, "size": file.size, "type": kind}, status=201)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_like(request, pk):
    content = get_object_or_404(Content, pk=pk)
    if not _can_interact(request.user, content):
        return Response({"detail": "You need access to this content to like it."}, status=403)
    like, created = Like.objects.get_or_create(user=request.user, content=content)
    if not created:
        like.delete()
    return Response({"is_liked": created, "likes_count": content.likes.count()})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def content_comments(request, pk):
    content = get_object_or_404(Content, pk=pk)
    if request.method == "GET":
        if not _can_interact(request.user, content):
            return Response({"detail": "You need access to this content to view comments."}, status=403)
        comments = content.comments.select_related("user").all()
        return Response(CommentSerializer(comments, many=True).data)
    # POST
    if not _can_interact(request.user, content):
        return Response({"detail": "You need access to this content to comment."}, status=403)
    serializer = CommentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    comment = Comment.objects.create(user=request.user, content=content, body=serializer.validated_data["body"])
    return Response(CommentSerializer(comment).data, status=201)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def comment_detail(request, pk):
    comment = get_object_or_404(Comment.objects.select_related("content"), pk=pk)
    if comment.user_id != request.user.id and not request.user.is_staff and comment.content.owner_id != request.user.id:
        return Response({"detail": "You can only delete your own comments."}, status=403)
    comment.delete()
    return Response(status=204)


@api_view(["POST"])
@permission_classes([AllowAny])
def share_content(request, pk):
    content = get_object_or_404(Content, pk=pk, status=Content.Status.PUBLISHED)
    type(content).objects.filter(pk=content.pk).update(share_count=F("share_count") + 1)
    content.refresh_from_db(fields=["share_count"])
    return Response({"share_count": content.share_count})


class FollowingContentPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 50

class FollowingContentView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        Content.publish_due()
        ordering = request.query_params.get("ordering", "newest")
        followed_influencers = request.user.following.values_list("following_id", flat=True)
        queryset = (Content.objects
            .filter(owner_id__in=followed_influencers, status=Content.Status.PUBLISHED)
            .select_related("owner"))
        if ordering == "oldest":
            queryset = queryset.order_by("created_at", "id")
        else:
            queryset = queryset.order_by("-created_at", "-id")
        paginator = FollowingContentPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = FollowingContentSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)
