from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django import forms
from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path

from . import dao
from .models import Image, Store, Product, Category, UserRole, Account, Attribute, Order, OrderDetail, PaymentType, \
    ShippingType, Bill


class eCommerceAdminSite(admin.AdminSite):
    site_header = 'eCommerce - System'

    def get_urls(self):
        return [
                   path('account-stats/', self.account_stats_view),
                   path('order_stats/', self.order_stats_view),

               ] + super().get_urls()

    def account_stats_view(self, request):
        # account_count = Account.objects.count()
        # info = Account.objects.values("full_name", "role__name_role")
        return TemplateResponse(request, 'admin/account_stats.html', {
            'load_account': dao.load_account(),
            'stats_account': dao.count_account_by_role()
        })

    def order_stats_view(self, request):
        month = request.GET.get('month')
        quarter = request.GET.get('quarter')
        year = request.GET.get('year')
        return TemplateResponse(request, 'admin/order_stats.html', {
            'order_in_month': dao.get_order_count_in_month(month),
            'order_in_quarter': dao.get_order_count_in_quarter(quarter),
            'order_in_year': dao.get_order_count_in_year(year)
        })

    def count_quantity_product_in_order(self, request):
        month = request.GET.get('month')
        year = request.GET.get('year')
        quarter = request.GET.get('quarter')
        return TemplateResponse(request, 'admin/count_product_in_order.html', {
            'quantity_in_order': dao.get_count_quantity_product_in_order_by_month(month),
            'quantity_in_order_year': dao.get_count_quantity_product_in_order_by_year(year),
            'quantity_in_order_quarter': dao.get_count_quantity_product_in_order_by_quarter(quarter)
        })


class AccountAdmin(admin.ModelAdmin):
    class Media:
        css = {
            'all': ('/static/css/main.css',)
        }

    list_display = ['id', 'username', 'password', "full_name", 'date_of_birth', 'gender', 'address', 'email', 'phone',
                    'is_active', 'role']
    search_fields = ['id', 'username']
    list_filter = ['role', 'is_active']
    readonly_fields = ["avt"]

    # def avatar(self, account):
    #     return mark_safe(
    #         "<img src='/static/{img_url}' alt='{alt}' width='120px'/>".format(img_url=account.avt, alt="Error"))


class ProductForm(forms.Form):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Product
        fields: '__all__'


class ProductAdmin(admin.ModelAdmin):
    list_filter = ['category', 'status']
    forms = ProductForm


class ProductInline(admin.StackedInline):
    model = Product
    extra = 1


class CategoryAdmin(admin.ModelAdmin):
    inlines = (ProductInline,)


adminSite = eCommerceAdminSite('myEcommerce')

adminSite.register(Store)
adminSite.register(Product, ProductAdmin)
adminSite.register(Account, AccountAdmin)
adminSite.register(Category, CategoryAdmin)
adminSite.register(UserRole)
adminSite.register(Attribute)
adminSite.register(Image)
adminSite.register(Order)
adminSite.register(OrderDetail)

adminSite.register(PaymentType)
adminSite.register(ShippingType)

# vnpay
adminSite.register(Bill)
