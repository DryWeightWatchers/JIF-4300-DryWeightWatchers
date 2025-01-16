from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("An email is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

# 'Custom' user model to be used with Django's built-in authentication

class User(AbstractUser):
    PATIENT = 'patient'
    PROVIDER = 'provider'
    ROLE_CHOICES = [
        (PATIENT, 'Patient'),
        (PROVIDER, 'Doctor'),
    ]

    email = models.EmailField(unique=True)
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] 
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    objects = UserManager()

    def __str__(self):
        return f"{self.email}, ({self.role})"

# User Role profiles for user-specific fields.

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    medications = models.TextField(blank=True)

class Provider(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    medications = models.TextField(blank=True)

# Other tables/fields with many-to-one relations to a patient profile.

class TreatmentRelationship(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)

class WeightRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2)

class PatientNote(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)