# from rest_framework import permissions
#
#
# class OwnerAuth(permissions.IsAuthenticated):
#     def has_object_permission(self, request, view, obj):
#         return self.has_permission(request, view) and request.user == obj.user
#
#
# class IsSaler(permissions.IsAuthenticated):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role_id == 2
#
#     def has_object_permission(self, request, view, obj):
#         return self.has_permission(request, view) and obj.role_id == 2
#
from rest_framework import permissions


class OwnerAuth(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view) and request.user == obj.account


class IsSaler(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.account.role_id == 2

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view) and obj.role_id == 2
