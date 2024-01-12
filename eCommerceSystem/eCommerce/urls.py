from django.urls import include, re_path, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.routers import DefaultRouter

from . import views
from .admin import adminSite



router = DefaultRouter()
router.register('accounts', views.AccountViewSet)
router.register('categories', views.CategoryViewSet)
router.register('products', views.ProductViewSet)
router.register('images', views.ImageViewSet)
router.register('roles', views.RoleViewSet)
router.register('orders', views.OrderViewSet)
router.register('stores', views.StoreViewSet)
router.register('shippingTypes', views.ShippingView)
router.register('paymentTypes', views.PaymentView)
router.register('comments', views.CommentView)

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', adminSite.urls),

]
