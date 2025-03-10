from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager
from phonenumber_field.modelfields import PhoneNumberField
import random 
import string 

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
        (PROVIDER, 'Provider'),
    ]
    first_name = models.CharField(max_length=50) 
    last_name = models.CharField(max_length=50) 
    phone = PhoneNumberField(region='US', blank=True, null=True)
    email = models.EmailField(unique=True)
    shareable_id = models.CharField(max_length=9, blank=True, null=True, default=None) 
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=PATIENT)

    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] 
    objects = UserManager()

    def generate_shareable_id(self): 
        alphabet = string.ascii_uppercase + string.digits  # A-Z, 0-9 
        random_id = ''.join(random.choices(alphabet, k=8)) 
        return '-'.join([random_id[:4], random_id[4:]]) 
    
    def save(self, *args, **kwargs): 
        if self.role == self.PROVIDER and not self.shareable_id: 
            self.shareable_id = self.generate_shareable_id() 
        super().save(*args, **kwargs) 

    def __str__(self):
        return f"{self.email}, ({self.role})"

class PatientInfo(models.Model):
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    patient = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'PATIENT'},
        related_name='patient_info'
    )
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # in cm 
    date_of_birth = models.DateField(null=True, blank=True)  # for keeping track of age 
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, null=True, blank=True)
    medications = models.TextField(null=True, blank=True)
    other_info = models.TextField(null=True, blank=True) 
    last_updated = models.DateTimeField(auto_now=True)

# Other tables/fields with many-to-one relations to a patient profile.

class TreatmentRelationship(models.Model):
    patient = models.ForeignKey(
        User, 
        limit_choices_to={'role': User.PATIENT}, 
        on_delete=models.CASCADE, 
        related_name='treatment_patients'
    )
    provider = models.ForeignKey(
        User, 
        limit_choices_to={'role': User.PROVIDER}, 
        on_delete=models.CASCADE, 
        related_name='treatment_providers'
    )

class WeightRecord(models.Model):
    patient = models.ForeignKey(
        User, 
        limit_choices_to={'role': User.PATIENT}, 
        on_delete=models.CASCADE, 
        related_name='weight_records'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2)

class PatientNote(models.Model):
    patient = models.ForeignKey(
        User, 
        limit_choices_to={'role': User.PATIENT}, 
        on_delete=models.CASCADE, 
        related_name='patient_notes'
    )
    timestamp = models.DateTimeField(blank=True, null=True)
    note = models.TextField(blank=True)

class PatientReminder(models.Model):
    patient = models.ForeignKey(
        User, 
        limit_choices_to={'role': User.PATIENT}, 
        on_delete=models.CASCADE, 
        related_name='patient_reminders'
    )
    time = models.TimeField()
    days = models.CharField(max_length=62)
    timestamp = models.DateTimeField(auto_now_add=True, blank=True, null=True)

class DeactivatedUsers(models.Model):
    original_id = models.IntegerField(unique=True)
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    deactivated_at = models.DateTimeField(auto_now_add=True)