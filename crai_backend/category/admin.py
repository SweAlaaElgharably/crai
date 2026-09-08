from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["id", "english_title", "arabic_title", "slug", "image"]
    list_filter = []
    search_fields = ["english_title", "arabic_title", "slug"]
    prepopulated_fields = {"slug": ("english_title",)}
