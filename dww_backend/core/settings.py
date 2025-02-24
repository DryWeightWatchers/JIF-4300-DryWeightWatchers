"""
Django settings for dww_backend project.

Generated by 'django-admin startproject' using Django 5.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
from dotenv import load_dotenv 
import os 
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# load environment variables from `.env` file 
load_dotenv()

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key")

# SECURITY WARNING: don't run with debug turned on in production!
DJANGO_ENV = os.getenv('DJANGO_ENV', "development")
DEBUG = DJANGO_ENV == "development"

# the domain that the browser will send the cookie back to. Will also send to subdomains of this domain. 
# defaults to sending only to the exact domain where the cookie originated from 
SESSION_COOKIE_DOMAIN = None
SESSION_COOKIE_AGE = 60*60*24*7  # provider sessions expire after 1 week

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS").split(",")

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "api",
    "rest_framework",
    'rest_framework.authtoken',
    "rest_framework_simplejwt",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", 
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware", 
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
MIDDLEWARE.insert(len(MIDDLEWARE) - 1, "core.middleware.DebugMiddleware")

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(minutes=15),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY, 
    "VERIFYING_KEY": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

ROOT_URLCONF = "core.urls"

CORS_ALLOWED_ORIGINS = [
    'http://localhost:8081',
    'https://dryweightwatchers.com',
    'https://www.dryweightwatchers.com',
    os.getenv("FRONTEND_URL", "http://localhost:5173"), # this line is necessary for the CORS Policy in the two different env
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

SESSION_ENGINE = 'django.contrib.sessions.backends.db'

CSRF_TRUSTED_ORIGINS = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    'http://localhost:8081',
    'https://dryweightwatchers.com',
    'https://www.dryweightwatchers.com',
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        'NAME': os.getenv("DATABASE_NAME"), 
        'USER': os.getenv("DATABASE_USER"),
        'PASSWORD': os.getenv("DATABASE_PASSWD"),
        'HOST': os.getenv("DATABASE_HOST"),
        'PORT': os.getenv("DATABASE_PORT")
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTH_USER_MODEL = 'api.User'


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

if DJANGO_ENV == "production":
    SECURE_SSL_REDIRECT = True  # Should be True if using HTTPS in production
    SESSION_COOKIE_SAMESITE = 'None'  # Required for cross-origin authentication
    SESSION_COOKIE_SECURE = True  # Must be True for HTTPS
    SESSION_COOKIE_HTTPONLY = True  # Ensures JavaScript can't access the session
    SESSION_COOKIE_NAME = 'sessionid'  # Default Django session cookie name

    CSRF_COOKIE_SAMESITE = 'None'  # Required for cross-origin CSRF protection
    CSRF_COOKIE_SECURE = True  # Must be True for HTTPS
    CSRF_COOKIE_HTTPONLY = True  # Prevents JavaScript from accessing CSRF cookie
    CORS_ALLOW_HEADERS = [
        "Authorization",
        "Content-Type",
        "X-CSRFToken",
        "Access-Control-Allow-Origin"
    ]

else:
    SECURE_SSL_REDIRECT = False # for this to work we need a valid SSL which we can only get if we pay for a domain, so for now I'll leave it with HTTP

    SESSION_COOKIE_SAMESITE = 'None'  # Allow cross-origin cookies
    SESSION_COOKIE_SECURE = True  # False for local dev (HTTP); True for production (HTTPS)
    SESSION_COOKIE_HTTPONLY = True  # Ensure the cookie is not accessible via JavaScript
    SESSION_COOKIE_NAME = 'sessionid'

    # CSRF Cookie Settings for Cross-Site Contexts
    CSRF_COOKIE_SAMESITE = 'None'  # Allow cross-origin CSRF cookies
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = True
