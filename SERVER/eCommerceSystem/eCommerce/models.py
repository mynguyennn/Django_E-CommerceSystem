from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from django import forms
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.Model):
    name_role = models.CharField(max_length=255, null=False)

    def __str__(self):
        return self.name_role


class Account(AbstractUser):
    full_name = models.CharField(max_length=255, null=True)
    date_of_birth = models.DateField(null=True)
    gender = models.BooleanField(null=True)
    address = models.CharField(max_length=255, null=True)
    email = models.EmailField(unique=True, null=True)
    phone = models.CharField(max_length=15, null=True)
    avt = CloudinaryField('avt', null=True)
    role = models.ForeignKey(UserRole, on_delete=models.CASCADE, related_name="roles", null=True)
    social_user_id = models.CharField(max_length=255, unique=True, null=True, blank=True)


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Store(BaseModel):
    name_store = models.CharField(max_length=255, null=False)
    address = models.CharField(max_length=500, null=False)
    active = models.BooleanField(default=False)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    avt = CloudinaryField('avt', null=True)

    def __str__(self):
        return self.name_store


class Category(models.Model):
    name_category = models.CharField(max_length=255, null=False)

    def __str__(self):
        return self.name_category


class Product(BaseModel):
    name_product = models.CharField(max_length=255, null=False)
    price = models.FloatField(null=False)
    description = RichTextField()
    status = models.BooleanField(default=False)
    quantity = models.IntegerField(null=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name='products')
    product_order = models.ManyToManyField('Order', through='OrderDetail', related_name='product_order', null=True)
    tag = models.BooleanField(default=False, null=True)
    tag_start_date = models.DateTimeField(null=True, blank=True)
    tag_end_date = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return self.name_product


class Attribute(models.Model):
    name_at = models.CharField(max_length=255, null=False)
    value = models.CharField(max_length=255, null=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attribute', null=True)

    def __str__(self):
        return self.name_at + " (" + self.product.name_product + ")"


class Image(models.Model):
    thumbnail = CloudinaryField('image', null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.product.name_product


class PaymentType(models.Model):
    name_paymentType = models.CharField(max_length=255, null=False)

    def __str__(self):
        return self.name_paymentType


class ShippingType(models.Model):
    name_shippingType = models.CharField(max_length=255, null=False)
    price_shippingType = models.FloatField(null=False)

    def __str__(self):
        return self.name_shippingType


class Order(BaseModel):
    shipping_address = models.CharField(max_length=255)
    shipping_fee = models.FloatField()
    note = models.TextField(null=False)
    status_pay = models.BooleanField(default=False)
    status_order = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    paymentType = models.ForeignKey(PaymentType, on_delete=models.CASCADE)
    shippingType = models.ForeignKey(ShippingType, on_delete=models.CASCADE)

    # order_cart = models.ManyToManyField(Cart, through='OrderDetail', related_name='orderDetail')

    def __str__(self):
        return "Đơn hàng [" + self.account.username + "]" + " + Địa chỉ [" + self.shipping_address + "]"


class OrderDetail(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    status_review = models.BooleanField(default=False, null=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)

    def __str__(self):
        return self.product.name_product + " - Đơn hàng [username: " + self.order.account.username + "]"


class Bill(models.Model):
    bill_code = models.CharField(max_length=200, null=True, blank=True)
    total_amount = models.FloatField(default=0, null=True, blank=True)
    bill_transactionNo = models.CharField(max_length=200, null=True, blank=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='bill', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"Bill - {self.bill_code} + Order - {self.order}"


class PaymentForm(forms.Form):
    order_id = forms.CharField(max_length=200)
    order_type = forms.CharField(max_length=20)
    amount = forms.IntegerField()
    order_desc = forms.IntegerField()
    bank_code = forms.CharField(max_length=20, required=False)
    language = forms.CharField(max_length=2)


# class ReviewStore(BaseModel):
#     rating = models.IntegerField()
#     content = models.TextField()
#     account = models.ForeignKey(Account, on_delete=models.CASCADE)
#     store = models.ForeignKey(Store, on_delete=models.CASCADE)
#     order = models.OneToOneField(Order, null=True, blank=True, on_delete=models.CASCADE)
#
#     def __str__(self):
#         return f"{self.account.full_name} đã đánh giá cửa hàng {self.store.name_store}"


class CommentProduct(BaseModel):
    rating = models.IntegerField()
    content = models.TextField()
    reply_idComment = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    orderDetail = models.ForeignKey(OrderDetail, on_delete=models.CASCADE, null=True)

    def is_comment_owner(self, user):
        return self.account == user

    def is_shop_owner(self, user):
        return self.orderDetail.product.store.account == user

    def __str__(self):
        return f"{self.account.full_name} đã bình luận sản phẩm {self.orderDetail.product.name_product}"


class Follow(BaseModel):
    follower = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"Follower: {self.follower}"
