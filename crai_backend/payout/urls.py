from django.urls import path
from .views import (
    PayoutSummaryView,
    BankAccountListCreateView,
    BankAccountDetailView,
    WithdrawalListCreateView,
    WithdrawalDetailView,
)

urlpatterns = [
    path("summary/", PayoutSummaryView.as_view(), name="payout-summary"),
    path("bank-accounts/", BankAccountListCreateView.as_view(), name="bank-account-list"),
    path("bank-accounts/<int:pk>/", BankAccountDetailView.as_view(), name="bank-account-detail"),
    path("withdrawals/", WithdrawalListCreateView.as_view(), name="withdrawal-list"),
    path("withdrawals/<int:pk>/", WithdrawalDetailView.as_view(), name="withdrawal-detail"),
]
