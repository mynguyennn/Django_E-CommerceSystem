from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .admin import adminSite

router = DefaultRouter()
router.register('accounts', views.AccountViewSet)
router.register('categories', views.CategoryViewSet)
router.register('products', views.ProductViewSet)
router.register('images', views.ImageViewSet)
router.register('roles', views.RoleViewSet)
router.register('stores', views.StoreViewSet)
router.register('shippingTypes', views.ShippingView)
router.register('paymentTypes', views.PaymentView)
router.register('comments', views.CommentView)
router.register('attribute', views.AttributeViewSet)
router.register('orders', views.OrderViewSet)
router.register('orderdetails', views.OrderDetailViewSet)
router.register('bill', views.BillViewSet)
router.register('follows', views.FollowViewSet)



# app_name = 'paypal,admin'

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', adminSite.urls),

    # google
    path('google-login/', views.google_login, name='google_login'),
    # facebook
    path('facebook-login/', views.facebook_login, name='facebook_login'),

    # vnpay
    path('pay', views.index, name='index'),
    path('payment', views.payment, name='payment'),
    path('payment_ipn', views.payment_ipn, name='payment_ipn'),
    path('payment_return', views.payment_return, name='payment_return'),
    path('query', views.query, name='query'),
    path('refund', views.refund, name='refund'),

    # paypal
    path('sendpaypal/', views.send_paypal, name='sendpaypal'),
    path('paypal_success/<str:bill_code>/', views.paypal_success, name='paypal_success'),

]
