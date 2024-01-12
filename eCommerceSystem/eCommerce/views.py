import datetime
from ast import Str
from calendar import calendar
from collections import deque
from itertools import product, accumulate

from _testmultiphase import Str
from ckeditor_uploader.views import upload
from django.contrib.admin import action
from django.db.models.expressions import Ref
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, generics, permissions, status, parsers
from rest_framework.decorators import action, api_view
from rest_framework.generics import DestroyAPIView
from rest_framework.response import Response
from sqlparse.utils import imt
from urllib3 import request

from . import serializers, dao
from .models import Product, Category, Account, Image, UserRole, Order, Store, Attribute, PaymentType, ShippingType, \
    OrderDetail, CommentProduct, ReviewStore
from .serializers import RoleSerializer, ProductSerializer, CategorySerializer, AccountSerializer, ImageSerializer, \
    CommentProductSerializer, ReviewStoreSerialzer, StoreSerializer, AttributeSerializer
from eCommerce import perms


# class IsAdmin(permissions.BasePermission):
#     def isAdmin(self, request, view):
#         return request.account and request.account.is_staff


class AccountViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    # RetrieveAPIView lay thong in user dang login
    queryset = Account.objects.filter(is_active=True)
    serializer_class = serializers.AccountSerializer  # serializer du lieu ra thanh json
    parser_classes = [parsers.MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    # permission_classes = [IsAdmin]
    @swagger_auto_schema(
        operation_description="Get the current user",
        manual_parameters=[
            openapi.Parameter(
                name="Authorization",
                in_=openapi.IN_HEADER,
                type=openapi.TYPE_STRING,
                description="Bearer token",
                required=False,
                default="Bearer your_token_here"
            )
        ],
        responses={
            200: openapi.Response(
                description="SMS sent with password reset instructions",
            ),
            400: openapi.Response(
                description="User with this phone number does not exist",
            ),
        }
    )
    @action(methods=['get'], url_name='current_account', detail=False)
    def current_account(self, request):
        return Response(serializers.AccountSerializer(request.user).data)

    @action(methods=['Delete'], url_name='delete', detail=True)
    def delete_account(self, request, pk=None):
        if request.user.is_authenticated and request.user.is_staff:
            try:
                user = Account.objects.get(pk=pk)
                user.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Account.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    @action(methods=['PATCH'], detail=False)
    def update_avatar(self, request, *args, **kwargs):
        user = request.user
        if request.user.is_authenticated and perms.OwnerAuth:
            avt_file = request.FILES.get('avt')
            if avt_file:
                user.avt = avt_file
                user.save()
                serializer = AccountSerializer(request.user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            account = self.queryset.get(pk=pk)
            serializer = self.serializer_class(account)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Account.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # permission_classes = [permissions.IsAuthenticated]


class ProductViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    # pagination_class = paginations.ProductPagination
    parser_classes = [parsers.MultiPartParser]

    # permission_classes = [permissions.IsAuthenticated]

    # def get_permissions(self):
    #     if self.request.authenticators:
    #         return [permissions.IsAuthenticated]
    #     return [permissions.AllowAny()]

    # @action(methods=['Get'], detail=True)
    # def get_images(self, request, pk):
    #     product = self.queryset.filter(pk=pk).first()
    #     if not product:
    #         return Response(status=status.HTTP_404_NOT_FOUND)
    #     images = product.images.all()
    #     return Response(serializers.)
    @action(methods=['GET'], detail=False)
    def get_list_product_in_cart(self, request):
        products = request.data.getlist('product')
        quantitys = request.data.getlist('quantity')
        orderdetails = []
        total = 0
        for name_pro, quantity_pro in zip(products, quantitys):
            product = Product.objects.get(pk=name_pro)
            total_price = product.price * int(quantity_pro)
            total += total_price
            infor = {
                'product': serializers.ProductSerializer(product).data,
                'quantity': quantity_pro
            }
            orderdetails.append(infor)
            # lấy tiền ship đầu tiên hiện lên
            shipping = ShippingType.objects.first()
            shipping_price = shipping.price_shippingType
            total += shipping_price
        return Response({
            'products_in_cart': orderdetails,
            'shipping_price': shipping_price,
            'total': total
        })

    @action(methods=['post'], detail=True)
    def add_attribute(self, request, pk):
        product = self.get_object()
        names = request.data.getlist('name_at')
        values = request.data.getlist('value')
        attributes = []
        for name_att, value_att in zip(names, values):
            attribute, created = Attribute.objects.get_or_create(name_at=name_att, value=value_att, product=product)
            attributes.append(attribute)
        return Response(serializers.AttributeSerializer(attributes, many=True, context={'request': request}).data)

    @action(methods=['GET'], detail=False)
    def get_product_by_category(self, request):
        pro = []
        id_category = request.query_params.get('category')
        try:
            product = Product.objects.filter(category=id_category)
        except:
            return Response('Không có sản phẩm nào ', status=status.HTTP_400_BAD_REQUEST)
        for p in product:
            pro.append({
                'name_product': p.name_product,
                'price': p.price,
                'quantity': p.quantity
            })
        return Response(pro, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def compare_product(self, request):
        id_product_1 = request.query_params.get('id_1')
        id_product_2 = request.query_params.get('id_2')
        pro_1 = []
        pro_2 = []
        try:
            product_1 = Product.objects.filter(id=id_product_1)
        except:
            return Response('Không tìm thấy sản phẩm', status=status.HTTP_400_BAD_REQUEST)
        try:
            product_2 = Product.objects.filter(id=id_product_2)
        except:
            return Response('Không tìm thấy sản phẩm', status=status.HTTP_400_BAD_REQUEST)
        # breakpoint()
        for p_1 in product_1:
            attribute_data = AttributeSerializer(p_1.attribute.all(), many=True).data
            pro_1.append({
                'name_prodcut': p_1.name_product,
                'price': p_1.price,
                'description': p_1.description,
                'product_attributes': attribute_data,
                'store': p_1.store.name_store
            })

        for p_2 in product_2:
            attribute_data = AttributeSerializer(p_2.attribute.all(), many=True).data
            pro_2.append({
                'name_product': p_2.name_product,
                'price': p_2.price,
                'description': p_2.description,
                'product_attributes': attribute_data,
                'store': p_2.store.name_store
            })
        return Response({'product_1': pro_1, 'product_2': pro_2}, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def get_queryset(self):
        query = self.queryset

        name = self.request.query_params.get("name")
        if name:
            query = query.filter(name_product__icontains=name)

        name_store = self.request.query_params.get("name_store")
        if name_store:
            query = query.filter(store__name_store__icontains=name_store)

        price = self.request.query_params.get("price")
        if price:
            query = query.filter(price__icontains=price)
        return query

    @action(methods=['GET'], detail=False)
    def sort_by_name(self, request):
        sort_name = self.queryset.order_by('name_product')
        serializer = ProductSerializer(sort_name, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False)
    def sort_by_price_up(self, request):
        sort_price = self.queryset.order_by('price')
        serializer = ProductSerializer(sort_price, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False)
    def sort_by_price_down(self, request):
        sort_price = self.queryset.order_by('-price')
        serializer = ProductSerializer(sort_price, many=True)
        return Response(serializer.data)


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['post'], detail=False)
    def add_image_in_product(self, request):
        user = request.user
        imgs = request.FILES.getlist('thumbnail')
        product_id = int(request.data.get('product'))

        if not imgs:
            return Response("Image is required.", status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response("Product does not exist.", status=status.HTTP_400_BAD_REQUEST)

        check = False
        # self.serializer_class().push_images_for_house(house_id, new_image)
        for img in imgs:
            image = Image.objects.create(thumbnail=img, product=product)
            image.save()
            check = True

        if check == True:
            return Response("Thanh cong roi nhe", status=status.HTTP_200_OK)
        else:
            return Response('loi roi do hoang', status=status.HTTP_400_BAD_REQUEST)


class RoleViewSet(viewsets.ViewSet,
                  generics.ListAPIView):
    queryset = UserRole.objects.all()
    serializer_class = RoleSerializer


class OrderViewSet(viewsets.ViewSet):
    queryset = Order.objects.all()
    serializer_class = serializers.OrderSerializer

    # permission_classes = [permissions.IsAuthenticated]
    @action(methods=['POST'], detail=False)
    def create_order(self, request):
        # user = request.user
        shipping_address = request.data.get('shipping_address')
        shipping_fee = request.data.get('shipping_fee')
        note = request.data.get('note')
        status_pay = request.data.get('status_pay')
        status_review = request.data.get('status_review')
        status_order = request.data.get('status_order')
        account = int(request.data.get('account'))
        paymentType_id = int(request.data.get('paymentType'))
        shippingType_id = int(request.data.get('shippingType'))
        if request.user.is_authenticated and request.user.role_id == 2:

            if not shipping_address or not shipping_fee or not note or not paymentType_id or not shippingType_id:
                return Response({'error': 'Thông tin  không đủ'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                account = Account.objects.get(id=account)
            except Account.DoesNotExist:
                return Response("Không tìm thấy tài khoản.", status=status.HTTP_400_BAD_REQUEST)

            try:
                payment_type = PaymentType.objects.get(id=paymentType_id)
            except PaymentType.DoesNotExist:
                return Response("Không tìm thấy loại thanh toán.", status=status.HTTP_400_BAD_REQUEST)

            try:
                shipping_type = ShippingType.objects.get(id=shippingType_id)
            except ShippingType.DoesNotExist:
                return Response("Không tìm thấy loại vận chuyển.", status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.create(shipping_address=shipping_address, shipping_fee=shipping_fee, note=note,
                                         status_pay=0, status_review=0,
                                         status_order=0, account=account, paymentType=payment_type,
                                         shippingType=shipping_type)
            order.save()
            return Response(serializers.OrderSerializer(order).data, status=status.HTTP_200_OK)
        else:
            return Response('Bạn Không có quyền mua hàng')

    @action(methods=['Post'], detail=True)
    def create_orderdetail(self, request, pk):
        order_id = Order.objects.get(pk=pk)
        products = request.data.getlist('product')
        quantitys = request.data.getlist('quantity')
        orderdetails = []
        total = 0
        for name_pro, quantity_pro in zip(products, quantitys):
            product = Product.objects.get(pk=name_pro)
            orderdetail, created = OrderDetail.objects.get_or_create(product=product, quantity=quantity_pro,
                                                                     order=order_id)
            total_price = product.price * int(quantity_pro)
            total += total_price
            orderdetails.append(orderdetail)
        return Response(
            {'order_detail': serializers.OderDetailSerializer(orderdetails, many=True).data, 'total': total})

    @action(detail=False, methods=['Get'], url_path='quantity_in_order_month')
    def quantity_in_order_month(self, request):
        month = request.query_params.get('month')
        counts_quantity = dao.get_count_quantity_product_in_order_by_month(month)
        data = []
        for count in counts_quantity:
            store_data = {
                'name_store': count['name_store'],
                'counts_quantity': count['counts_quantity']
            }
            data.append(store_data)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['Get'], url_path='quantity_in_order_year')
    def quantity_in_order_year(self, request):
        year = request.query_params.get('year')
        counts_quantity = dao.get_count_quantity_product_in_order_by_year(year)
        data = []
        for count in counts_quantity:
            store_data = {
                'name_store': count['name_store'],
                'counts_quantity': count['counts_quantity']
            }
            data.append(store_data)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['Get'], url_path='quantity_in_order_quarter')
    def quantity_in_order_quarter(self, request):
        quarter = request.query_params.get('quarter')
        counts_quantity = dao.get_count_quantity_product_in_order_by_quarter(quarter)
        data = []
        for count in counts_quantity:
            store_data = {
                'name_store': count['name_store'],
                'counts_quantity': count['counts_quantity']
            }
            data.append(store_data)
        return Response(data, status=status.HTTP_200_OK)


class StoreViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Store.objects.all()
    serializer_class = serializers.StoreSerializer

    # permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get the current user",
        manual_parameters=[
            openapi.Parameter(
                name="Authorization",
                in_=openapi.IN_HEADER,
                type=openapi.TYPE_STRING,
                description="Bearer token",
                required=False,
                default="Bearer your_token_here"
            )
        ],
        responses={
            200: openapi.Response(
                description="SMS sent with password reset instructions",
            ),
            400: openapi.Response(
                description="User with this phone number does not exist",
            ),
        }
    )
    @action(methods=['POST'], detail=False)
    def create_store(self, request):
        user = request.user
        if user.role_id != 2:
            return Response({'error': 'Khong co quyen tao cua hang'}, status=status.HTTP_403_FORBIDDEN)

        existing_store = Store.objects.filter(account=user)

        if existing_store.exists():
            return Response({'error': 'You already have a store.'}, status=status.HTTP_400_BAD_REQUEST)

        store_data = request.data.copy()
        store_data['account'] = user.id
        serializer = serializers.StoreSerializer(data=store_data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=True)
    def add_product(self, request, pk):
        user = request.user
        store = self.get_object()
        category_id = int(request.data.get('category'))
        quantity = int(request.data.get('quantity'))
        description = request.data.get('description')
        name_product = request.data.get('name_product')
        price = float(request.data.get('price'))

        if user.is_authenticated and user.role_id == 2:
            if not quantity or not name_product or not description or not price:
                return Response({'error': 'Thông tin sản phẩm không đủ'}, status=status.HTTP_400_BAD_REQUEST)

            if not store:
                return Response({'error': 'Bạn không có cửa hàng để thêm sản phẩm'}, status=status.HTTP_404_NOT_FOUND)

            category = Category.objects.get(pk=category_id)
            if not category:
                return Response({'error': 'Bạn không có lọai mặt hàng'}, status=status.HTTP_404_NOT_FOUND)

            product = Product.objects.create(name_product=name_product, store=store, category=category,
                                             quantity=quantity, description=description, price=price)
            product.save()
            return Response(serializers.ProductSerializer(product).data, status=status.HTTP_201_CREATED)

        return Response({'error': 'Bạn không có quyền thêm sản phẩm.'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['Get'], url_path='get_order_count_in_month')
    def get_order_count_month(self, request, *args, **kwargs):
        month = request.query_params.get('month')
        order_counts = dao.get_order_count_in_month(month)
        data = []
        for count in order_counts:
            store_data = {
                'name_store': count['name_store'],
                'order_count': count['order_counts']
            }
            data.append(store_data)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['Get'], url_path='get_order_count_in_year')
    def get_order_count_year(self, request):
        year = request.query_params.get('year')
        order_counts = dao.get_order_count_in_year(year)
        data = []
        for count in order_counts:
            store_data = {
                'name_store': count['name_store'],
                'order_count': count['order_counts']
            }
            data.append(store_data)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['Get'], url_path='get_order_count_in_quarter')
    def get_order_count_quarter(self, request):
        quarter = request.query_params.get('quarter')
        order_counts = dao.get_order_count_in_quarter(quarter)
        data = []
        for count in order_counts:
            store_data = {
                'name_store': count['name_store'],
                'order_count': count['order_counts']
            }
            data.append(store_data)
        return Response(data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def product_revenue_in_month(self, request, pk):
        data = []
        month = request.query_params.get('month')
        pro_revenue = dao.product_revenue_statistics_in_month(pk, month)
        for c in pro_revenue:
            data.append({
                'name_product': c['name_product'],
                'total_revenue': c['total_revenue']
            })
        return Response(data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def product_revenue_in_year(self, request, pk):
        data = []
        year = request.query_params.get('year')
        pro_revenue = dao.product_revenue_statistics_in_year(pk, year)
        for p in pro_revenue:
            data.append({
                'name_product': p['name_product'],
                'total_revenue': p['total_revenue']
            })
        return Response(data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def product_revenue_in_quarter(self, request, pk):
        data = []
        quarter = request.query_params.get('quarter')
        pro_revenue = dao.product_revenue_statistics_in_quarter(pk, quarter)
        for p in pro_revenue:
            data.append({
                'name_product': p['name_product'],
                'total_revenue': p['total_revenue']
            })
        return Response(data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def category_revenue_in_month(self, request, pk):
        data = []
        month = request.query_params.get('month')
        cate_revenue = dao.category_revenue_statistics_in_month(pk, month)
        for c in cate_revenue:
            data.append({
                'name_category': c['category__name_category'],
                'category_revenues': c['total_revenue']
            })
        return Response(data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def category_revenue_in_year(self, request, pk):
        data = []
        year = request.query_params.get('year')
        cate_revenue = dao.category_revenue_statistics_in_year(pk, year)
        for c in cate_revenue:
            data.append({
                'name_category': c['category__name_category'],
                'category_revenues': c['total_revenue']
            })
        return Response(data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def category_revenue_in_quater(self, request, pk):
        data = []
        quarter = request.query_params.get('quarter')
        cate_revenue = dao.category_revenue_statistics_in_quarter(pk, quarter)
        for c in cate_revenue:
            data.append({
                'name_category': c['category__name_category'],
                'category_revenues': c['total_revenue']
            })
        return Response(data, status=status.HTTP_200_OK)
    # @action(methods=['GET'], detail=True)
    # def product_revenue_12month_of_year(self, request, pk):
    #     data =[]
    #     year = int(request.data.get('select_year'))  # Convert to integer
    #     months = [datetime.date(year, month, 1) for month in range(1, 13)]
    #     product_revneue = dao.product_revenue_12month_of_year(pk, year)
    #     for p in product_revneue:
    #         total_revenue = 0
    #         for month in months:  # Giả sử months là một danh sách các đối tượng datetime cho mỗi tháng
    #             total_revenue_key = f'total_revenue_{month.strftime("%b")}'
    #             total_revenue += p[total_revenue_key]
    #
    #         data.append({
    #             'name_product': p['name_product'],
    #             'total_revenue': total_revenue
    #         })
    #     return Response(data, status=status.HTTP_200_OK)


class ShippingView(viewsets.ViewSet, generics.ListAPIView,
                   generics.CreateAPIView, generics.UpdateAPIView,
                   generics.DestroyAPIView):
    queryset = ShippingType.objects.all()
    serializer_class = serializers.ShipingTypeSerializer


class PaymentView(viewsets.ViewSet, generics.ListAPIView,
                  generics.CreateAPIView, generics.UpdateAPIView,
                  generics.DestroyAPIView):
    queryset = PaymentType.objects.all()
    serializer_class = serializers.PaymentTypeSerializer


class CommentView(viewsets.ViewSet, generics.ListAPIView):
    queryset = CommentProduct.objects.all()
    serializer_class = serializers.CommentProductSerializer

    # permission_classes = [permissions.IsAuthenticated]

    @action(methods=['POST'], detail=False)
    def add_comment_product(self, request):
        account_id = request.query_params.get('account_id')
        orderdetail_id = request.query_params.get('orderdetail')
        rating_pro = int(request.data.get('rating'))
        content_pro = request.data.get('content')
        # breakpoint()
        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response("Không tìm thấy tài khoản.", status=status.HTTP_400_BAD_REQUEST)
        try:
            orderdetail = OrderDetail.objects.get(id=orderdetail_id)
        except OrderDetail.DoesNotExist:
            return Response('Không tìm thấy Orderdetail', status=status.HTTP_400_BAD_REQUEST)

        if not content_pro or not rating_pro:
            return Response('Dữ liệu thiếu', status=status.HTTP_400_BAD_REQUEST)

        comment = CommentProduct.objects.create(rating=rating_pro, content=content_pro, account=account, orderDetail=orderdetail)
        comment.save()
        return Response(serializers.CommentProductSerializer(comment).data, status=status.HTTP_200_OK)




class ReviewStoreView(viewsets.ViewSet, generics.ListAPIView):
    queryset = ReviewStore.objects.all()
    serializer_class = serializers.ReviewStoreSerialzer
