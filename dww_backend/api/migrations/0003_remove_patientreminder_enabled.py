# Generated by Django 5.1.3 on 2025-02-11 13:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_patientreminder_enabled'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='patientreminder',
            name='enabled',
        ),
    ]
