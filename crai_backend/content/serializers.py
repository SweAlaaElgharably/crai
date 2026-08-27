from rest_framework import serializers
from django.utils import timezone
from .models import Content, Comment
from category.models import Category
from crai_backend.utils import absolute_url


class SecureImageField(serializers.ImageField):
    def to_representation(self, value):
        url = super().to_representation(value)
        if url and not url.startswith("http"):
            request = self.context.get("request")
            if request:
                url = absolute_url(request, url)
        return url


class CommentSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "user_details", "body", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_user_details(self, obj):
        request = self.context.get("request")
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "avatar": absolute_url(request, obj.user.avatar.url) if request and obj.user.avatar else (obj.user.avatar.url if obj.user.avatar else None),
        }

    def validate_body(self, value):
        body = (value or "").strip()
        if not body:
            raise serializers.ValidationError("Comment cannot be empty.")
        return body[:2000]


class ContentSerializer(serializers.ModelSerializer):
    is_free = serializers.ReadOnlyField()
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    status = serializers.ChoiceField(choices=Content.Status.choices, required=False)
    category_name = serializers.SerializerMethodField()
    owner_details = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    cover_image = SecureImageField()
    class Meta:
        model = Content
        fields = ["id", "title", "cover_image", "body", "price", "is_free", "owner", "owner_details", "category", "category_name", "created_at", "updated_at", "access_duration_days", "status", "scheduled_at", "published_at", "likes_count", "comments_count", "share_count", "is_liked"]
        read_only_fields = ["id", "owner", "is_free", "created_at", "updated_at", "published_at", "likes_count", "comments_count", "share_count", "is_liked"]
    def get_likes_count(self, obj):
        return obj.likes.count()
    def get_comments_count(self, obj):
        return obj.comments.count()
    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not getattr(request, "user", None) or not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()
    def get_category_name(self, obj):
        request = self.context.get("request")
        accept = (request.META.get("HTTP_ACCEPT_LANGUAGE") or "") if request else ""
        if obj.category is None:
            return None
        if "ar" in accept.lower() and obj.category.arabic_title:
            return obj.category.arabic_title
        return obj.category.english_title
    def get_owner_details(self, obj):
        request = self.context.get("request")
        return {
            "username": obj.owner.username,
            "first_name": obj.owner.first_name,
            "last_name": obj.owner.last_name,
            "avatar": absolute_url(request, obj.owner.avatar.url) if request and obj.owner.avatar else (obj.owner.avatar.url if obj.owner.avatar else None),
        }
    def validate_price(self, value):
        if value < 0: raise serializers.ValidationError("Price cannot be negative.")
        return value
    def validate_access_duration_days(self, value):
        if value < 1: raise serializers.ValidationError("Access duration must be at least 1 day.")
        return value
    def validate(self, attrs):
        status_value = attrs.get("status") or getattr(getattr(self, "instance", None), "status", None) or Content.Status.DRAFT
        scheduled_at = attrs.get("scheduled_at") or getattr(getattr(self, "instance", None), "scheduled_at", None)
        if status_value == Content.Status.SCHEDULED:
            if not scheduled_at:
                raise serializers.ValidationError({"scheduled_at": "Scheduled time is required for scheduled content."})
            if scheduled_at <= timezone.now():
                raise serializers.ValidationError({"scheduled_at": "Scheduled time must be in the future."})
        else:
            attrs["scheduled_at"] = None
        return attrs
    def create(self, validated_data):
        if validated_data.get("status") == Content.Status.PUBLISHED:
            validated_data["published_at"] = timezone.now()
        return super().create(validated_data)
    def update(self, instance, validated_data):
        new_status = validated_data.get("status", instance.status)
        if new_status == Content.Status.PUBLISHED and instance.status != Content.Status.PUBLISHED and not instance.published_at:
            validated_data["published_at"] = timezone.now()
        return super().update(instance, validated_data)

class FollowingContentSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    is_free = serializers.ReadOnlyField()
    cover_image = SecureImageField()
    class Meta:
        model = Content
        fields = ["id", "cover_image", "title", "created_at", "owner", "is_free",]
    def get_owner(self, obj):
        request = self.context.get("request")
        return {
            "id": obj.owner.id,
            "username": obj.owner.username,
            "first_name": obj.owner.first_name,
            "last_name": obj.owner.last_name,
            "avatar": absolute_url(request, obj.owner.avatar.url) if request and obj.owner.avatar else (obj.owner.avatar.url if obj.owner.avatar else None),
        }
