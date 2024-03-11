from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-@b4klm-f*w#*i3@zd^!n8d16%rpxehx=esiyekor1r#gv@#e&x'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'eCommerce.apps.EcommerceConfig',
    'rest_framework',
    'rest_framework.authtoken',
    'oauth2_provider',
    'drf_yasg',
    'corsheaders',
    'cloudinary',
    'ckeditor',
    'ckeditor_uploader',
    'paypal'
]

CLIENT_ID = "dMlVgp3i59e91nDEGZ0Kq6D7uLX6MKLq3RL68eoT"
CLIENT_SECRET = "hA095gEXYFSqRCnt2fN2qgzWRL7M6Xpay3Bjd8ddQLVc7LhQzH7mYibKpOrMR7soZhthIaWsKf6rxBHDWohV5ePKNIMFmQQT9gEgS3Dt3ngvlv6zftrKtwk8usb5wFLH"

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'healthcouchhcm@gmail.com'
EMAIL_HOST_PASSWORD = 'jemzbwclgoaffzag'
# jemz bwcl goaf fzag

import cloudinary

cloudinary.config(
    cloud_name="diyeuzxqt",
    api_key="599941136112728",
    api_secret="FK5DmkFmGOJev3sTfwLLOnPI4tw"
)

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8081",
]


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    # 'PAGE_SIZE': 8
}

AUTH_USER_MODEL = 'eCommerce.Account'

import pymysql

pymysql.install_as_MySQLdb()

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',

]

ROOT_URLCONF = 'eCommerceSystem.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'eCommerceSystem.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'dbserver',
        'USER': 'root',
        'PASSWORD': 'Admin@123',
        'HOST': 'localhost'  # mặc định localhost
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

# TIME_ZONE = 'Asia/Ho_Chi_Minh'
TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'
MEDIA_ROOT = '%s/eCommerce/static/' % BASE_DIR
CKEDITOR_UPLOAD_PATH = "product/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# OAUTH2_PROVIDER = {
#     'OAUTH2_BACKEND_CLASS': 'oauth2_provider.oauth2_backends.JSONOAuthLibCore'
# }


# VNPAY CONFIG
VNPAY_RETURN_URL = 'http://10.0.2.2:8000/payment_return'
VNPAY_PAYMENT_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
VNPAY_API_URL = 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
VNPAY_TMN_CODE = '39HWDUA3'
VNPAY_HASH_SECRET_KEY = 'EVMPTPMATYUYDPLADHRQXWZPUHOMHECE'

# PAYPAL
PAYPAL_RECEIVER_EMAIL = 'sb-w1yx229371283@business.example.com'
PAYPAL_TEST = True
PAYPAL_CLIENT_ID = 'AWumFGq3-EdxeljMErfxysvuBrsCaddwvIbEVsmHMSB2XYURigAIPA72lJtm0o05fPFwde1dBtxkHS2j'
PAYPAL_SECRET = 'EGTJu0bV99PPqdoxiM83UXTKvRS63DbTH2gLxdFAP170Il63EAG1HUNJozRKTv0l7gk38C1gaKk-i0Be'