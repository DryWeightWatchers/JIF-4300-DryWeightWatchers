# Generated by Django 5.1.4 on 2025-03-08 19:45

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_alter_patientnote_note_type_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="patientnote",
            name="note_type",
        ),
        migrations.CreateModel(
            name="PatientInfo",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("height", models.DecimalField(decimal_places=2, max_digits=5)),
                ("date_of_birth", models.DateField()),
                (
                    "sex",
                    models.CharField(
                        choices=[("M", "Male"), ("F", "Female"), ("O", "Other")],
                        max_length=1,
                    ),
                ),
                ("medications", models.TextField(blank=True)),
                ("other_info", models.TextField(blank=True)),
                ("last_updated", models.DateTimeField(auto_now=True)),
                (
                    "patient_id",
                    models.OneToOneField(
                        limit_choices_to={"role": "PATIENT"},
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="patient_info",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
