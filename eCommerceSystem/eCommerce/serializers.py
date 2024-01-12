from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from urllib.parse import urljoin
from .models import Image, Product, Category, Attribute, Store, Account, UserRole, Order, PaymentType, ShippingType, OrderDetail, CommentProduct, ReviewStore


class RoleSerializer(ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', "name_role"]


class AccountSerializer(ModelSerializer):
    role_name = RoleSerializer(source='role', read_only=True)

    # role = serializers.PrimaryKeyRelatedField(queryset=UserRole.objects.all(), write_only=True)
    # avt_info = serializers.SerializerMethodField(source='avt')
    # avt = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Account
        fields = ['id', 'full_name', 'date_of_birth', 'gender', 'address', 'email', 'phone', 'username', 'password',
                  'avt', 'role_name']
        extra_kwargs = {
            'password': {'write_only': 'true'}
        }

    def get_avt(self, avt):
        url = 'https://res.cloudinary.com/ddcsszxcb/'
        if avt.avt and url not in urljoin(url, avt.avt.url):
            return avt.avt.url
        return None

    avt = serializers.SerializerMethodField(method_name='get_avt')

    def create(self, validated_data):
        data = validated_data.copy()
        account = Account(**data)
        account.set_password(data['password'])
        account.save()
        # breakpoint()
        return account


class StoreSerializer(ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'
        # fields = ["id", "name_store", "address", "active"]


class CategoryListSerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ["name_category"]


class AttributeSerializer(ModelSerializer):
    class Meta:
        model = Attribute
        fields = ["name_at", 'value']
        # fields = ["id", "name_at", "data_type"]


class ProductSerializer(ModelSerializer):
    product_attributes = AttributeSerializer(many=True, read_only=True, source='attribute')
    # store_info = StoreSerializer(source='store', read_only=True)
    category_info = CategoryListSerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name_product", "price", "description", "status", "quantity", "store", "category_info",
                  'product_attributes']


class ImageSerializer(ModelSerializer):
    # product_info = ProductSerializer(source='product', read_only=True)
    # thumbnails = serializers.SerializerMethodField(source='thumbnail')

    class Meta:
        model = Image
        fields = ['id', 'thumbnail', 'product']

    def get_thumbnail(self, image):
        url = 'https://res.cloudinary.com/ddcsszxcb/'
        if image.thumbnail and url not in urljoin(url, image.thumbnail.url):
            return image.thumbnail.url

    thumbnail = serializers.SerializerMethodField(method_name='get_thumbnail')


class CategorySerializer(ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name_category", "products"]


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"


class ShipingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingType
        fields = '__all__'


class PaymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentType
        fields = '__all__'


class OderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderDetail
        fields ='__all__'


class CommentProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentProduct
        fields = '__all__'


class ReviewStoreSerialzer(serializers.ModelSerializer):
    class Meta:
        model = ReviewStore
        fields = '__all__'