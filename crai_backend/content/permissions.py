from django.db.models import Q
from django.utils import timezone
from rest_framework.permissions import BasePermission
from payment.models import Enrollment


class ContentPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if view.action in ["list", "create"]:
            return (request.user.is_staff or request.user.user_type == "influencer")
        if view.action == "retrieve":
            return True
        if view.action in ["update", "partial_update", "destroy"]:
            return (request.user.is_staff or request.user.user_type == "influencer")
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if view.action == "retrieve":
            if request.user.is_staff or obj.owner_id == request.user.id:
                return True
            return obj.status == "published"
        if view.action in ["update","partial_update","destroy"]:
            return (request.user.user_type == "influencer" and obj.owner_id == request.user.id)
        return False