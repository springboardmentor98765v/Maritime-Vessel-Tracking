from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in self.allowed_roles
        )


class IsAdmin(RolePermission):
    allowed_roles = ["admin"]


class IsAnalyst(RolePermission):
    allowed_roles = ["analyst"]


class IsOperator(RolePermission):
    allowed_roles = ["operator"]
