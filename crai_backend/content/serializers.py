from rest_framework import serializers
from .models import Content, Lesson

class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = "__all__"

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = "__all__"

class ContentPreviewSerializer(serializers.ModelSerializer):
    owner_first_name = serializers.CharField(source="owner.first_name", read_only=True)
    owner_last_name = serializers.CharField(source="owner.last_name", read_only=True)
    owner_avatar = serializers.ImageField(source="owner.avatar", read_only=True)
    category_id = serializers.CharField(source="category.id", read_only=True)
    subcategory_id = serializers.CharField(source="subcategory.id", read_only=True)
    
    class Meta:
        model = Content
        fields = ["id", "owner_first_name", "owner_last_name", "owner_avatar", "english_title", "arabic_title", "image", "fake_price", "real_price", "slug", "category_id", "subcategory_id"]
