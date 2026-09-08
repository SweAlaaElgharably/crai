from django.contrib import admin
from .models import Content, Like, Comment


@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "owner", "category", "price", "status", "created_at", "published_at"]
    list_filter = ["status", "category", "created_at", "published_at"]
    search_fields = ["title", "owner__username", "owner__email", "category__english_title"]
    list_select_related = ["owner", "category"]
    readonly_fields = ["share_count", "created_at", "updated_at", "published_at"]
    actions = ["publish_items", "draft_items"]

    @admin.action(description="Publish selected contents")
    def publish_items(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status=Content.Status.PUBLISHED, published_at=timezone.now())
        self.message_user(request, f"{updated} content(s) published.")

    @admin.action(description="Move selected contents to draft")
    def draft_items(self, request, queryset):
        updated = queryset.update(status=Content.Status.DRAFT, published_at=None)
        self.message_user(request, f"{updated} content(s) moved to draft.")


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "content", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__username", "user__email", "content__title"]
    raw_id_fields = ["user", "content"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "content", "short_body", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__username", "user__email", "content__title", "body"]
    raw_id_fields = ["user", "content"]

    @admin.display(description="Comment")
    def short_body(self, obj):
        return obj.body[:60] + "..." if len(obj.body) > 60 else obj.body
