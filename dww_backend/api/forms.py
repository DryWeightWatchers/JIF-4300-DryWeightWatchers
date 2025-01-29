from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

# Django's built-in UserCreationForm handles first_name, last_name, email, password1 + 2, and also validates, such as password match, unique emails, valid emails, etc.
# one annoying thing is that it doesnt allow 'password' to be a password because its too simple. Annoying.
class CustomUserCreationForm(UserCreationForm):
    role = forms.ChoiceField(choices=User.ROLE_CHOICES, required=True)
    phone = forms.CharField(max_length=15, required=False) 

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'password1', 'password2', 'role']


class RegisterProviderForm (forms.ModelForm): 

    password = forms.CharField(max_length=100) 
    confirmPassword = forms.CharField(max_length=100) 

    class Meta: 
        model = User 
        fields = ['first_name', 'last_name', 'email', 'phone']

    def clean_email(self): 
        email = self.cleaned_data.get('email') 
        print(f'clean_email: {email}')
        if not email: 
            raise forms.ValidationError("Email cannot be empty.") 
        if User.objects.filter(email=email).exists(): 
            raise forms.ValidationError("An account with this email already exists.") 
        return email 

    def clean(self): 
        cleaned_data = super().clean() 
        password = cleaned_data.get('password') 
        confirmPassword = cleaned_data.get('confirmPassword') 
        if password != confirmPassword: 
            self.add_error('password', 'Passwords do not match!')
        return cleaned_data 