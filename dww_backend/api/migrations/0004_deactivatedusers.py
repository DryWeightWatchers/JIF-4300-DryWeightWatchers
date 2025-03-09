# Generated by Django 5.1.4 on 2025-03-07 16:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_remove_patientreminder_enabled"),
    ]

    operations = [
        migrations.CreateModel(
            name="DeactivatedUsers",
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
                ("original_id", models.IntegerField(unique=True)),
                ("firstname", models.CharField(max_length=255)),
                ("lastname", models.CharField(max_length=255)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("phone", models.CharField(blank=True, max_length=20, null=True)),
                ("deactivated_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
