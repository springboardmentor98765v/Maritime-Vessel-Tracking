from rest_framework.permissions import BasePermission

class IsAdminUserRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "ADMIN"

class IsAnalyst(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "ANALYST"

class IsOperator(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "OPERATOR"