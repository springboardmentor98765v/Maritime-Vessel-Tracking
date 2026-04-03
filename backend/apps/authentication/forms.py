from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User, Group

class UserRegistrationForm(UserCreationForm):
    ROLE_CHOICES = [
        ('Operator', 'Operator'),
        ('Analyst', 'Analyst'),
        ('Admin', 'Admin'),
    ]
    role = forms.ChoiceField(choices=ROLE_CHOICES, required=True, label="Role")
    first_name = forms.CharField(max_length=30, required=True, label="Name")
    email = forms.EmailField(required=True, label="Email Address")

    class Meta:
        model = User
        fields = ['first_name', 'email', 'role'] # UserCreationForm adds username and password fields automatically

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError("A user with this email already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.first_name = self.cleaned_data['first_name']
        user.email = self.cleaned_data['email']
        user.username = self.cleaned_data['email'] # Use email as username
        user.is_staff = True # Allow access to admin site
        
        if commit:
            user.save()
            role_name = self.cleaned_data['role']
            group, created = Group.objects.get_or_create(name=role_name)
            user.groups.add(group)
        return user
