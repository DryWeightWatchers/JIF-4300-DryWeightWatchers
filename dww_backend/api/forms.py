from django import forms
from django.contrib.auth.forms import UserCreationForm
from phonenumber_field.formfields import PhoneNumberField
from .models import User

class CustomUserCreationForm(UserCreationForm):
    role = forms.ChoiceField(choices=User.ROLE_CHOICES, required=True)

    class Meta:
        model = User
        fields = ['email', 'password1', 'password2', 'role']


class RegisterProviderForm (forms.Form): 
    firstname = forms.CharField(max_length=50) 
    lastname = forms.CharField(max_length=50) 
    email = forms.EmailField() 
    # note: phone field is flexible with formatting but will reject numbers with invalid numbers 
    # (e.g. nonexisting area code) 
    phone = PhoneNumberField(region='US', required=False) 
    password = forms.CharField(max_length=100) 
    confirmPassword = forms.CharField(max_length=100) 

    def clean(self): 
        cleaned_data = super().clean() 
        password = cleaned_data.get('password') 
        confirmPassword = cleaned_data.get('confirmPassword') 
        if password != confirmPassword: 
            raise forms.ValidationError('Passwords do not match!') 
        return cleaned_data 