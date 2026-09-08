from decimal import Decimal
from django.db.models import Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from payment.models import Order
from .models import BankAccount, Withdrawal
from .serializers import BankAccountSerializer, WithdrawalSerializer, PayoutSummarySerializer


PLATFORM_FEE_PERCENT = Decimal("0.15")
MIN_WITHDRAWAL_AMOUNT = Decimal("500.00")


class PayoutSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        total_earnings = (
            Order.objects.filter(status="paid", content__owner=user)
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )
        platform_fee = (total_earnings * PLATFORM_FEE_PERCENT).quantize(Decimal("0.01"))
        net_earnings = total_earnings - platform_fee

        pending_withdrawals = (
            Withdrawal.objects.filter(user=user, status__in=["pending", "processing"])
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )
        completed_withdrawals = (
            Withdrawal.objects.filter(user=user, status="completed")
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )
        available_balance = net_earnings - pending_withdrawals - completed_withdrawals
        if available_balance < 0:
            available_balance = Decimal("0")

        data = {
            "total_earnings": total_earnings,
            "platform_fee": platform_fee,
            "net_earnings": net_earnings,
            "pending_withdrawals": pending_withdrawals,
            "completed_withdrawals": completed_withdrawals,
            "available_balance": available_balance,
        }
        serializer = PayoutSummarySerializer(data)
        return Response(serializer.data)


class BankAccountListCreateView(ListCreateAPIView):
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BankAccount.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, is_active=False)


class BankAccountDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BankAccount.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(is_active=False)


class WithdrawalListCreateView(ListCreateAPIView):
    serializer_class = WithdrawalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Withdrawal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError

        user = self.request.user
        amount = serializer.validated_data["amount"]

        if amount < MIN_WITHDRAWAL_AMOUNT:
            raise ValidationError({"amount": f"Minimum withdrawal amount is {MIN_WITHDRAWAL_AMOUNT} SAR"})

        bank_account = serializer.validated_data["bank_account"]
        if bank_account.user != user or not bank_account.is_active:
            raise ValidationError({"bank_account": "Only an active, verified bank account can be used"})

        total_earnings = (
            Order.objects.filter(status="paid", content__owner=user)
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )
        platform_fee = (total_earnings * PLATFORM_FEE_PERCENT).quantize(Decimal("0.01"))
        net_earnings = total_earnings - platform_fee
        pending_withdrawals = (
            Withdrawal.objects.filter(user=user, status__in=["pending", "processing"])
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )
        completed_withdrawals = (
            Withdrawal.objects.filter(user=user, status="completed")
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )
        available = net_earnings - pending_withdrawals - completed_withdrawals
        if available < 0:
            available = Decimal("0")

        if amount > available:
            raise ValidationError({"amount": f"Insufficient balance. Available: {available} SAR"})

        serializer.save(user=user)


class WithdrawalDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = WithdrawalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Withdrawal.objects.filter(user=self.request.user)
