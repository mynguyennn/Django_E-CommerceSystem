from urllib.parse import urljoin

from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from .models import Image, Product, Category, Attribute, Store, Account, UserRole, Order, PaymentType, ShippingType, \
    OrderDetail, CommentProduct, ReviewStore, Bill, Follow


class RoleSerializer(ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', "name_role"]


class AccountSerializer(ModelSerializer):
    # role = RoleSerializer(source='role', read_only=True)

    # role = serializers.PrimaryKeyRelatedField(queryset=UserRole.objects.all(), write_only=True)
    # avt_info = serializers.SerializerMethodField(source='avt')
    # avt = serializers.SerializerMethodField(method_name='get_avatar')

    class Meta:
        model = Account
        fields = ['id', 'full_name', 'date_of_birth', 'gender', 'address', 'email', 'phone', 'username', 'password',
                  'avt', 'role']
        extra_kwargs = {
            'password': {'write_only': 'true'}
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if representation.get('avt'):
            representation['avt'] = "https://res.cloudinary.com/diyeuzxqt/" + representation['avt']

        return representation

    def create(self, validated_data):
        data = validated_data.copy()
        account = Account(**data)
        account.set_password(data['password'])
        account.save()
        # breakpoint()
        return account


class FollowedStoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ["id", "name_store", "address", "active", 'account', 'avt']

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if representation.get('avt'):
            representation['avt'] = "https://res.cloudinary.com/diyeuzxqt/" + representation['avt']

        return representation


class FollowSerializer(serializers.ModelSerializer):
    store_info = FollowedStoreSerializer(source='store', read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'store', 'store_info']


class StoreSerializer(ModelSerializer):
    followers = FollowSerializer(read_only=True, many=True, source='follow_set')

    class Meta:
        model = Store
        fields = ["id", "name_store", "address", "active", 'account', 'avt', 'followers']
        # fields = ["id", "name_store", "address", "active"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if representation.get('avt'):
            representation['avt'] = "https://res.cloudinary.com/diyeuzxqt/" + representation['avt']

        return representation


class CategoryListSerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ["name_category"]


class AttributeSerializer(ModelSerializer):
    class Meta:
        model = Attribute
        fields = ["id", "name_at", 'value']
        # fields = ["id", "name_at", "data_type"]


class ImageSerializer(ModelSerializer):
    # product_info = ProductSerializer(source='product', read_only=True)
    # thumbnails = serializers.SerializerMethodField(source='thumbnail')

    class Meta:
        model = Image
        fields = ['id', 'thumbnail', 'product']

    def get_thumbnail(self, image):
        url = 'https://res.cloudinary.com/diyeuzxqt/'
        if image.thumbnail and url not in urljoin(url, image.thumbnail.url):
            return image.thumbnail.url

    thumbnail = serializers.SerializerMethodField(method_name='get_thumbnail')


class ProductSerializer(ModelSerializer):
    product_attributes = AttributeSerializer(many=True, read_only=True, source='attribute')
    store_info = StoreSerializer(source='store', read_only=True)
    category_info = CategoryListSerializer(source='category', read_only=True)
    images = ImageSerializer(many=True, read_only=True, source='image_set')

    class Meta:
        model = Product
        fields = ["id", "name_product", "price", "description", "status", "quantity", "store_info", "category_info",
                  'product_attributes', 'images', 'tag']


class ProductQuantityUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField()


class CategorySerializer(ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name_category", "products"]


class ShipingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingType
        fields = '__all__'


class PaymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentType
        fields = '__all__'


class OrderDetailSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = OrderDetail
        fields = ["id", "product", "quantity", "order", "status_review"]


class OrderSerializer(serializers.ModelSerializer):
    # orderdetails = OderDetailSerializer(many=True, read_only=True, source='order')
    account_info = AccountSerializer(source='account', read_only=True)
    paymentType = PaymentTypeSerializer(read_only=True)
    shippingType = ShipingTypeSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ["id", "shipping_address", "note", "shipping_fee", "status_pay", "status_order",
                  "created_at", "account_info"
            , "paymentType", "shippingType"]


class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = '__all__'


class CommentProductSerializer(serializers.ModelSerializer):
    account_info = AccountSerializer(source='account', read_only=True)

    class Meta:
        model = CommentProduct
        fields = ['id', 'account_info', 'rating', 'content', 'reply_idComment', 'orderDetail', 'created_at']


class CommentProductByUserSerializer(serializers.ModelSerializer):
    account_info = AccountSerializer(source='account', read_only=True)
    product_info = ProductSerializer(source='orderDetail.product', read_only=True)

    class Meta:
        model = CommentProduct
        fields = ['id', 'account_info', 'rating', 'content', 'reply_idComment', 'orderDetail', 'created_at', 'product_info']



class ProductWithCommentsSerializer(serializers.ModelSerializer):
    comments = CommentProductSerializer(many=True, read_only=True)
    product_attributes = AttributeSerializer(many=True, read_only=True, source='attribute')
    store_info = StoreSerializer(source='store', read_only=True)
    category_info = CategoryListSerializer(source='category', read_only=True)
    images = ImageSerializer(many=True, read_only=True, source='image_set')

    class Meta:
        model = Product
        fields = ['id', 'name_product', 'price', 'description', 'product_attributes', 'status', 'quantity',
                  'store_info', 'category_info', 'images', 'comments']


class ReviewStoreSerialzer(serializers.ModelSerializer):
    class Meta:
        model = ReviewStore
        fields = '__all__'
