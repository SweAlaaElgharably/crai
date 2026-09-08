from django.contrib import admin
from .models import Order, Enrollment


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "content", "amount", "status", "method", "tap_charge_id", "created_at"]
    list_filter = ["status", "method", "created_at"]
    search_fields = ["id", "user__username", "user__email", "content__title", "tap_charge_id"]
    list_select_related = ["user", "content"]
    readonly_fields = ["created_at"]

    @admin.action(description="Mark selected orders as Paid")
    def mark_paid(self, request, queryset):
        updated = queryset.update(status=Order.Status.PAID)
        self.message_user(request, f"{updated} order(s) marked as paid.")

    @admin.action(description="Mark selected orders as Failed")
    def mark_failed(self, request, queryset):
        updated = queryset.update(status=Order.Status.FAILED)
        self.message_user(request, f"{updated} order(s) marked as failed.")


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "content", "expires_at", "created_at"]
    list_filter = ["created_at", "expires_at"]
    search_fields = ["user__username", "user__email", "content__title"]
    raw_id_fields = ["user", "content"]
