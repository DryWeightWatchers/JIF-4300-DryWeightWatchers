from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

# Django's built-in UserCreationForm handles first_name, last_name, email, password1 + 2, and also validates, such as password match, unique emails, valid emails, etc.
# one annoying thing is that it doesnt allow 'password' to be a password because its too simple. Annoying.
class CustomUserCreationForm(UserCreationForm):
    role = forms.ChoiceField(choices=User.ROLE_CHOICES, required=True)
    phone = forms.CharField(max_length=15) 

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'password1', 'password2', 'role']


class RegisterProviderForm (forms.Form): 
    firstname = forms.CharField(max_length=50) 
    lastname = forms.CharField(max_length=50) 
    email = forms.EmailField() 
    phone = forms.CharField(max_length=15, required=False)  # TODO: better phone number validation using a library 
    password = forms.CharField(max_length=100) 
    confirmPassword = forms.CharField(max_length=100) 

    def clean(self): 
        cleaned_data = super().clean() 
        password = cleaned_data.get('password') 
        confirmPassword = cleaned_data.get('confirmPassword') 
        if password != confirmPassword: 
            raise forms.ValidationError('Passwords do not match!') 
        return cleaned_data 