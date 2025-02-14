# Generated by Django 5.1.3 on 2025-02-10 19:04

import django.db.models.deletion
import django.utils.timezone
import phonenumber_field.modelfields
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('first_name', models.CharField(max_length=50)),
                ('last_name', models.CharField(max_length=50)),
                ('phone', phonenumber_field.modelfields.PhoneNumberField(blank=True, max_length=128, null=True, region='US')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('shareable_id', models.CharField(blank=True, default=None, max_length=9, null=True)),
                ('role', models.CharField(choices=[('patient', 'Patient'), ('provider', 'Provider')], default='patient', max_length=10)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PatientNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('note_type', models.CharField(blank=True, choices=[('generic', 'Generic'), ('medication', 'Medication')], default='generic', max_length=10, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True, null=True)),
                ('note', models.TextField(blank=True)),
                ('patient', models.ForeignKey(limit_choices_to={'role': 'patient'}, on_delete=django.db.models.deletion.CASCADE, related_name='patient_notes', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PatientReminder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('time', models.TimeField()),
                ('days', models.CharField(max_length=62)),
                ('timestamp', models.DateTimeField(auto_now_add=True, null=True)),
                ('patient', models.ForeignKey(limit_choices_to={'role': 'patient'}, on_delete=django.db.models.deletion.CASCADE, related_name='patient_reminders', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TreatmentRelationship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('patient', models.ForeignKey(limit_choices_to={'role': 'patient'}, on_delete=django.db.models.deletion.CASCADE, related_name='treatment_patients', to=settings.AUTH_USER_MODEL)),
                ('provider', models.ForeignKey(limit_choices_to={'role': 'provider'}, on_delete=django.db.models.deletion.CASCADE, related_name='treatment_providers', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='WeightRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('weight', models.DecimalField(decimal_places=2, max_digits=5)),
                ('patient', models.ForeignKey(limit_choices_to={'role': 'patient'}, on_delete=django.db.models.deletion.CASCADE, related_name='weight_records', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
