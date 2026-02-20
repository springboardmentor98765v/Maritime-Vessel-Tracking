from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def role_required(role_name):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(view, request, *args, **kwargs):
            if not request.user.role or request.user.role.name != role_name:
                return Response(
                    {"error": "Permission denied"},
                    status=status.HTTP_403_FORBIDDEN
                )
            return view_func(view, request, *args, **kwargs)
        return _wrapped_view
    return decorator
