# Generated by Django 5.1.4 on 2025-03-08 19:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0006_remove_patientnote_note_type_patientinfo"),
    ]

    operations = [
        migrations.RenameField(
            model_name="patientinfo",
            old_name="patient_id",
            new_name="patient",
        ),
    ]
