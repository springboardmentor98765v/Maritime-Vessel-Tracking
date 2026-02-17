from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import UserRegistrationForm

from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, authenticate

def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('/admin/') # Redirect to admin home after registration
    else:
        form = UserRegistrationForm()
    return render(request, 'accounts/register.html', {'form': form})

def unified_login_register(request):
    login_form = AuthenticationForm()
    register_form = UserRegistrationForm()

    if request.method == 'POST':
        action = request.POST.get('action')
        print(f"DEBUG: Processing action: {action}")
        
        if action == 'login':
            login_form = AuthenticationForm(request, data=request.POST)
            if login_form.is_valid():
                print("DEBUG: Login form valid")
                user = login_form.get_user()
                login(request, user)
                return redirect('/admin/') # Redirect after login
            else:
                print(f"DEBUG: Login form errors: {login_form.errors}")
        
        elif action == 'register':
            register_form = UserRegistrationForm(request.POST)
            if register_form.is_valid():
                print("DEBUG: Register form valid")
                user = register_form.save()
                login(request, user)
                return redirect('/admin/') # Redirect after registration
            else:
                 print(f"DEBUG: Register form errors: {register_form.errors}")

    return render(request, 'accounts/unified_login_register.html', {
        'login_form': login_form,
        'register_form': register_form
    })
