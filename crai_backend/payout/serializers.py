from rest_framework import serializers
from .models import BankAccount, Withdrawal
from crai_backend.utils import absolute_url


class BankAccountSerializer(serializers.ModelSerializer):
    account_file = serializers.FileField(allow_empty_file=False)
    account_file_url = serializers.SerializerMethodField()

    class Meta:
        model = BankAccount
        fields = ["id", "iban", "account_file", "account_file_url", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "is_active", "created_at", "updated_at", "account_file_url"]

    def get_account_file_url(self, obj):
        if not obj.account_file:
            return None
        request = self.context.get("request")
        return absolute_url(request, obj.account_file.url)


    def validate_iban(self, value):
        value = (value or "").upper().replace(" ", "")
        if len(value) < 15 or len(value) > 34:
            raise serializers.ValidationError("Invalid IBAN length")
        return value

    def validate_account_file(self, value):
        ext = (value.name or "").lower().rsplit(".", 1)[-1]
        if ext not in ("pdf", "png", "jpg", "jpeg"):
            raise serializers.ValidationError("Only PDF, PNG, or JPG files are allowed")
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must be less than 5MB")
        return value


class WithdrawalSerializer(serializers.ModelSerializer):
    bank_account_details = BankAccountSerializer(source="bank_account", read_only=True)

    class Meta:
        model = Withdrawal
        fields = ["id", "amount", "bank_account", "bank_account_details", "status", "notes", "admin_notes", "created_at", "processed_at"]
        read_only_fields = ["id", "status", "admin_notes", "created_at", "processed_at"]


class PayoutSummarySerializer(serializers.Serializer):
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = serializers.DecimalField(max_digits=10, decimal_places=2)
    net_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_withdrawals = serializers.DecimalField(max_digits=10, decimal_places=2)
    completed_withdrawals = serializers.DecimalField(max_digits=10, decimal_places=2)
    available_balance = serializers.DecimalField(max_digits=10, decimal_places=2)
