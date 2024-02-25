from django.urls import path, include, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions


# from eCommerceSystem.eCommerce.admin import adminSite
schema_view = get_schema_view(
    openapi.Info(
        title="eCommerce API",
        default_version='v1',
        description="APIs for eCommerce - System",
        contact=openapi.Contact(email="2051052046"),
        license=openapi.License(name="Huynh Minh Hoang"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    # path('admin/', adminSite.urls),
    path('', include("eCommerce.urls")),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0),
            name='schema-json'),
    re_path(r'^swagger/$',
            schema_view.with_ui('swagger', cache_timeout=0),
            name='schema-swagger-ui'),
    re_path(r'^redoc/$',
            schema_view.with_ui('redoc', cache_timeout=0),
            name='schema-redoc'),
    re_path(r'^ckeditor/', include('ckeditor_uploader.urls')),
]
