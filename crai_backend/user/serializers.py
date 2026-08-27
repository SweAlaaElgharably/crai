from rest_framework import serializers
from djoser.serializers import UserCreatePasswordRetypeSerializer, UserSerializer
from .models import User, UserFollow
from category.models import Category
from category.serializers import CategorySerializer
from content.serializers import FollowingContentSerializer, SecureImageField
from crai_backend.utils import absolute_url

class CustomUserCreateSerializer(UserCreatePasswordRetypeSerializer):
    interests = serializers.PrimaryKeyRelatedField(many=True, queryset=Category.objects.all(), required=False)
    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = UserCreatePasswordRetypeSerializer.Meta.fields + ("first_name", "last_name", "country_code", "phone", "user_type", "interests")

    def validate(self, attrs):
        interests = attrs.pop("interests", None)
        attrs = super().validate(attrs)
        if interests is not None:
            attrs["interests"] = interests
        return attrs

    def create(self, validated_data):
        interests = validated_data.pop("interests", [])
        user = super().create(validated_data)
        user.interests.set(interests)
        return user

class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = "__all__"

class CustomUserUpdateSerializer(UserSerializer):
    interests = serializers.PrimaryKeyRelatedField(many=True, queryset=Category.objects.all(), required=False)
    class Meta(UserSerializer.Meta):
        model = User
        fields = ("first_name", "last_name", "headline", "bio", "avatar", "country_code", "phone", "interests", "email")

class InfluencerDiscoverySerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(read_only=True)
    enrollments_count = serializers.IntegerField(read_only=True)
    avatar = SecureImageField()
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username", "avatar", "headline", "followers_count", "enrollments_count"]

class InfluencerProfileSerializer(serializers.ModelSerializer):
    interests = CategorySerializer(many=True, read_only=True)
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    content_count = serializers.IntegerField(read_only=True)
    is_following = serializers.BooleanField(read_only=True)
    contents = FollowingContentSerializer(many=True, read_only=True)
    avatar = SecureImageField()
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "headline", "bio", "avatar", "interests", "followers_count", "following_count", "content_count", "is_following", "contents"]

class InfluencerFollowerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="follower.id")
    username = serializers.CharField(source="follower.username")
    first_name = serializers.CharField(source="follower.first_name")
    last_name = serializers.CharField(source="follower.last_name")
    avatar = serializers.SerializerMethodField()
    joined_at = serializers.DateTimeField(source="created_at")
    class Meta:
        model = UserFollow
        fields = ["id", "username", "first_name", "last_name", "avatar", "joined_at"]

    def get_avatar(self, obj):
        if not obj.follower.avatar:
            return None
        request = self.context.get("request")
        return absolute_url(request, obj.follower.avatar.url) if request else obj.follower.avatar.url

class InfluencerSubscriberSerializer(serializers.ModelSerializer):
    joined_at = serializers.DateTimeField(source="subscribed_at")
    last_purchase_at = serializers.DateTimeField(read_only=True)
    purchases_count = serializers.IntegerField(read_only=True)
    avatar = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "avatar", "purchases_count", "joined_at", "last_purchase_at"]

    def get_avatar(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get("request")
        return absolute_url(request, obj.avatar.url) if request else obj.avatar.url

