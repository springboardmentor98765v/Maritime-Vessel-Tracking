from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages

@admin.action(description='Edit user details')
def edit_user_details(modeladmin, request, queryset):
    if queryset.count() != 1:
        modeladmin.message_user(
            request,
            "Please select exactly one user to edit.",
            messages.ERROR
        )
        return
    
    user = queryset.first()
    # Redirect to the change view of the selected user
    url = reverse(
        f'admin:{user._meta.app_label}_{user._meta.model_name}_change',
        args=[user.pk]
    )
    return redirect(url)

@admin.action(description='Change password')
def change_password_action(modeladmin, request, queryset):
    if queryset.count() != 1:
        modeladmin.message_user(
            request,
            "Please select exactly one user to change password.",
            messages.ERROR
        )
        return

    user = queryset.first()
    # Redirect to the password change view
    url = reverse(
        f'admin:{user._meta.app_label}_{user._meta.model_name}_password_change',
        args=[user.pk]
    )
    return redirect(url)

class CustomUserAdmin(UserAdmin):
    actions = [edit_user_details, change_password_action]

# Unregister the default User admin and register the custom one
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

admin.site.register(User, CustomUserAdmin)
print("ACCOUNTS ADMIN LOADED SUCCESSFULLY")
