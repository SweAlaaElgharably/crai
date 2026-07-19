from rest_framework import serializers
from djoser.serializers import UserCreatePasswordRetypeSerializer, UserSerializer
from .models import User

class InfluencerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "avatar", "headline"]


class CustomUserCreateSerializer(UserCreatePasswordRetypeSerializer):
    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = UserCreatePasswordRetypeSerializer.Meta.fields + ("first_name", "last_name", "country_code", "phone", "is_influencer")

class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = "__all__"

class CustomUserUpdateSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = ("first_name", "last_name", "headline", "bio", "avatar", "country_code", "phone")