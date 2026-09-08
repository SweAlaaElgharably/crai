from django.contrib import admin
from django.utils import timezone
from .models import BankAccount, Withdrawal


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ["iban", "user", "is_active", "file_link", "created_at", "updated_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["iban", "user__username", "user__email"]
    list_select_related = ["user"]
    readonly_fields = ["id", "user", "account_file", "created_at", "updated_at"]
    fields = ["id", "user", "iban", "account_file", "is_active", "created_at", "updated_at"]
    actions = ["activate_accounts", "deactivate_accounts"]

    @admin.display(description="File")
    def file_link(self, obj):
        if not obj.account_file:
            return "—"
        from django.utils.html import format_html
        return format_html('<a href="{}" target="_blank">view</a>', obj.account_file.url)

    @admin.action(description="Activate selected bank accounts")
    def activate_accounts(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} bank account(s) activated.")

    @admin.action(description="Deactivate selected bank accounts")
    def deactivate_accounts(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} bank account(s) deactivated.")


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "amount", "status", "bank_account_iban", "created_at", "processed_at"]
    list_filter = ["status", "created_at", "processed_at"]
    search_fields = ["user__username", "user__email", "bank_account__iban", "id"]
    list_select_related = ["user", "bank_account"]
    readonly_fields = ["id", "user", "bank_account", "amount", "created_at", "processed_at"]
    fields = ["id", "user", "amount", "bank_account", "status", "notes", "admin_notes", "created_at", "processed_at"]
    actions = ["mark_processing", "mark_completed", "mark_rejected", "mark_pending"]

    @admin.display(description="Bank Account")
    def bank_account_iban(self, obj):
        return obj.bank_account.iban

    def _set_status(self, request, queryset, status):
        queryset.update(status=status, processed_at=timezone.now())
        self.message_user(request, f"{queryset.count()} withdrawal(s) marked as {status}.")

    @admin.action(description="Mark selected withdrawals as Pending")
    def mark_pending(self, request, queryset):
        self._set_status(request, queryset, Withdrawal.Status.PENDING)

    @admin.action(description="Mark selected withdrawals as Processing")
    def mark_processing(self, request, queryset):
        self._set_status(request, queryset, Withdrawal.Status.PROCESSING)

    @admin.action(description="Mark selected withdrawals as Completed")
    def mark_completed(self, request, queryset):
        self._set_status(request, queryset, Withdrawal.Status.COMPLETED)

    @admin.action(description="Mark selected withdrawals as Rejected")
    def mark_rejected(self, request, queryset):
        self._set_status(request, queryset, Withdrawal.Status.REJECTED)
