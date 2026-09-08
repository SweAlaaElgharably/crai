from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserFollow


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["id", "username", "email", "phone", "user_type", "is_staff", "is_active", "date_joined"]
    list_filter = ["user_type", "is_staff", "is_active", "date_joined", "groups"]
    search_fields = ["username", "email", "phone", "first_name", "last_name", "user_type"]
    readonly_fields = ["date_joined", "last_login"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Extra Profile", {"fields": ("user_type", "headline", "country_code", "phone", "avatar", "bio", "interests")}),
    )


@admin.register(UserFollow)
class UserFollowAdmin(admin.ModelAdmin):
    list_display = ["id", "follower", "following", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["follower__username", "follower__email", "following__username", "following__email"]
    raw_id_fields = ["follower", "following"]
