import requests
import hashlib
import hmac
import os
from datetime import timedelta
from django.db import transaction
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from content.models import Content
from .models import *
from .serializers import OrderSerializer
from rest_framework.generics import ListAPIView, RetrieveAPIView
from content.serializers import ContentSerializer


from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from .serializers import ClientContentSerializer

# Create your views here.

TAP_SECRET = os.environ.get("TAP_SECRET")

PAYMENT_SOURCES = {
    "creditcard": "src_card",
    "mada": "src_sa.mada",
    "applepay": "src_apple_pay",
    "samsungpay": "src_samsung_pay",
    "stcpay": "src_sa.stcpay",
}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_charge(request):
    if not TAP_SECRET:
        return Response({"ok": False, "error": "Payment gateway is not configured."}, status=503)

    data = request.data
    method = data.get("method")
    source_id = PAYMENT_SOURCES.get(method)
    if not source_id:
        return Response({"ok": False, "error": "Unsupported payment method."}, status=400)
    phone = str(data.get("phone") or "").strip() if source_id == PAYMENT_SOURCES["stcpay"] else ""
    if source_id == PAYMENT_SOURCES["stcpay"] and not phone:
        return Response({"ok": False, "error": "Phone number is required for STC Pay."}, status=400)

    raw_id = data.get("content")
    try:
        content_id = int(raw_id)
    except (TypeError, ValueError):
        return Response({"ok": False, "error": "A single content id is required."}, status=400)

    try:
        content = Content.objects.get(id=content_id, status=Content.Status.PUBLISHED)
    except Content.DoesNotExist:
        return Response({"ok": False, "error": "This content is unavailable."}, status=400)

    # Free content is unlocked instantly without any charge.
    if content.is_free:
        _, created = Enrollment.objects.get_or_create(user=request.user, content=content)
        return Response({
            "url": None,
            "id": None,
            "order_id": None,
            "enrolled": [content.id] if created else [],
            "message": "Free content unlocked.",
        }, status=200)

    order = Order.objects.create(user=request.user, amount=content.price, status="pending", method=method, content=content)

    payload = {
        "amount": float(order.amount),
        "currency": "SAR",
        "customer": {
            "first_name": request.user.first_name or "-",
            "last_name": request.user.last_name or "-",
            "email": request.user.email or "-",
        },
        "merchant": {
            "id": "68015154",
        },
        "source": {
            "id": source_id,
        },
        "metadata": {
            "order_id": order.id,
            "content": str(content.id),
        },
        "post": {
            "url": "https://api.cr-ai.cloud/api/webhook/",
        },
        "redirect": {
            "url": "https://www.cr-ai.cloud/successpayment",
        },
    }
    if phone:
        payload["source"]["phone"] = {"country_code": "966", "number": phone}

    try:
        res = requests.post(
            "https://api.tap.company/v2/charges",
            json=payload,
            headers={"Authorization": f"Bearer {TAP_SECRET}", "Content-Type": "application/json"},
            timeout=30,
        )
        response = res.json()
    except requests.RequestException as e:
        order.status = "failed"
        order.save(update_fields=["status"])
        return Response({"ok": False, "error": str(e)}, status=503)

    if not res.ok:
        order.status = "failed"
        order.save(update_fields=["status"])
        return Response({"ok": False, "error": response}, status=400)

    order.tap_charge_id = response.get("id")
    order.save(update_fields=["tap_charge_id"])
    return Response({
        "url": response.get("transaction", {}).get("url"),
        "id": response.get("id"),
        "order_id": order.id,
        "enrolled": [],
    })


def _verify_tap_signature(request):
    secret = TAP_SECRET
    if not secret:
        return True
    provided = request.headers.get("Hashstring", "")
    if not provided:
        return False
    computed = hmac.new(secret.encode(), request.body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed.lower(), provided.strip().lower())


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_charge(request):
    data = request.data
    charge_id = data.get("id")
    otp = data.get("otp")
    if not charge_id or not otp:
        return Response({"ok": False, "error": "id and otp are required"}, status=400)
    payload = {
        "gateway_response": {
            "name": "STC_PAY",
            "response": {
                "reference": {
                    "otp": otp
                }
            }
        }
    }
    try:
        res = requests.put(
            f"https://api.tap.company/v2/charges/{charge_id}",
            json=payload,
            headers={"Authorization": f"Bearer {TAP_SECRET}", "Content-Type": "application/json"},
            timeout=30,
        )
        response = res.json()
    except requests.RequestException as e:
        return Response({"ok": False, "error": str(e)}, status=503)
    if res.status_code != 200:
        return Response({"ok": False, "error": response}, status=400)
    return Response(response)


@api_view(["POST"])
@permission_classes([AllowAny])
def tap_webhook(request):
    if not _verify_tap_signature(request):
        return Response({"ok": False, "error": "Invalid signature."}, status=403)

    payload = request.data
    status = payload.get("status")
    charge_id = payload.get("id")
    metadata = payload.get("metadata") or {}
    order_id = metadata.get("order_id")
    if not order_id:
        return Response({"ok": False, "error": "No order_id"}, status=400)
    try:
        order_id = int(order_id)
    except (ValueError, TypeError):
        return Response({"ok": False, "error": "Invalid order_id"}, status=400)

    if status not in ("CAPTURED", "FAILED"):
        return Response({"ok": True}, status=200)

    with transaction.atomic():
        try:
            order = Order.objects.select_for_update().get(id=order_id)
        except Order.DoesNotExist:
            return Response({"ok": False, "error": "Order not found"}, status=400)

        if order.status != Order.Status.PENDING:
            return Response({"ok": True}, status=200)

        if status == "CAPTURED":
            order.status = "paid"
            order.tap_charge_id = charge_id
            order.save(update_fields=["status", "tap_charge_id"])
            if order.content:
                Enrollment.objects.get_or_create(
                    user=order.user,
                    content=order.content,
                    defaults={"expires_at": timezone.now() + timedelta(days=order.content.access_duration_days)},
                )
        else:
            order.status = "failed"
            order.save(update_fields=["status"])

    return Response({"ok": True}, status=200)

# The CRUD Operations of Orders and Enrollments
class OrderListView(ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    
class OrderRetrieveView(RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
        
# User Content
class MyContentAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContentSerializer
    def get_queryset(self):
        return Content.objects.filter(enrollment__user=self.request.user)
        # .select_related("subcategory", "creator")

@api_view(["GET"])
@permission_classes([IsAdminUser])
def statics(request):
    return Response({
        "total_orders": Order.objects.count(),
        "total_enrollments": Enrollment.objects.count(),
        "total_contents": Content.objects.count(),
        "total_users": User.objects.count(),
        "total_influencers": User.objects.filter(user_type=User.UserType.INFLUENCER).count(),
        "total_clients": User.objects.filter(user_type=User.UserType.CLIENT).count(),
    })






















class ClientDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        now = timezone.now()
        paid_orders = Order.objects.filter(user=request.user, status=Order.Status.PAID)
        total_spent = (paid_orders.aggregate(total=Sum("amount"))["total"] or 0)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        spent_this_month = (paid_orders.filter(created_at__gte=start_of_month)
            .aggregate(total=Sum("amount"))["total"] or 0)
        enrollments = (Enrollment.objects.filter(user=request.user)
            .select_related("content").order_by("-created_at"))
        serializer = ClientContentSerializer(enrollments, many=True, context={"request": request},)
        return Response({
            "summary": {
                "total_spent": total_spent,
                "spent_this_month": spent_this_month,
                "content_count": enrollments.count(),
            },
            "content": serializer.data,
        })