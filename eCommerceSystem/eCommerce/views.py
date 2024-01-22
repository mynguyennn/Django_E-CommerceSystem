import datetime
from ast import Str
from calendar import calendar
from collections import deque
from itertools import product, accumulate, starmap
from pickletools import genops
from statistics import mean
from urllib.parse import urljoin

from _testmultiphase import Str
from ckeditor_uploader.views import upload
from django.contrib.admin import action
from django.contrib.sessions.backends.db import SessionStore
from django.core import mail
from django.db.models import Q, Sum, Avg, Count
from django.db.models.expressions import Ref
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, generics, permissions, status, parsers, request
from rest_framework.decorators import action, api_view
from rest_framework.generics import DestroyAPIView
from rest_framework.response import Response
from sqlparse.utils import imt
from urllib3 import request

from . import serializers, dao, paginations
from .models import Product, Category, Account, Image, UserRole, Order, Store, Attribute, PaymentType, ShippingType, \
    OrderDetail, CommentProduct, ReviewStore, Follow
from .serializers import RoleSerializer, ProductSerializer, CategorySerializer, AccountSerializer, ImageSerializer, \
    CommentProductSerializer, ReviewStoreSerialzer, StoreSerializer, AttributeSerializer, FollowSerializer
from eCommerce import perms


# class IsAdmin(permissions.BasePermission):
#     def isAdmin(self, request, view):
#         return request.account and request.account.is_staff


class AccountViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView, generics.ListAPIView):
    # RetrieveAPIView lay thong in user dang login
    queryset = Account.objects.filter(is_active=True)
    serializer_class = serializers.AccountSerializer  # serializer du lieu ra thanh json
    parser_classes = [parsers.MultiPartParser]

    # permission_classes = [permissions.IsAuthenticated]

    # permission_classes = [IsAdmin]
    @action(methods=['get'], url_name='current_account', detail=False)
    def current_account(self, request):
        return Response(serializers.AccountSerializer(request.user).data)

    # @action(methods=['POST'], detail=False)
    # def create_account(self, request):
    #     # id_role = request.data.get('id_role')
    #     serializer = serializers.AccountSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
            return Response(status=status.HTTP_400_BAD_REQUEST)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # permission_classes = [permissions.IsAuthenticated]


class ProductViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = paginations.ProductPagination
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
    @action(methods=['PATCH'], detail=True)
    def update_product(self, request, pk):
        product = self.get_object()
        check = False
        p = Product.objects.get(pk=product.id)
        image_id = request.data.getlist('image_id')
        new_image = request.FILES.getlist('thumbnail')
        quantity = int(request.data.get('quantity'))
        description = request.data.get('description')
        name_product = request.data.get('name_product')
        price = float(request.data.get('price'))
        category_id = int(request.data.get('category_id'))
        names = request.data.getlist('name_at')
        values = request.data.getlist('value')
        att = request.data.getlist('attribute_id')
        if quantity:
            tam_quantity = p.quantity
            p.quantity = quantity
            p.save()
            check = True
        if description:
            tam_description = p.description
            p.description = description
            p.save()
            check = True
        if name_product:
            tam_name_product = p.name_product
            p.name_product = name_product
            p.save()
            check = True
        if price:
            tam_price = p.price
            p.price = price
            p.save()
            check = True
        if category_id:
            cate = Category.objects.get(pk=category_id)
            tam_category_id = p.category_id
            p.category_id = cate
            p.save()
            check = True
        if image_id:
            for i, img in zip(image_id, new_image):
                image = Image.objects.get(id=i)
                tam_img = image.thumbnail
                image.thumbnail = img
                image.save()
                check = True

        if att:
            for a, name, value in zip(att, names, values):
                attribute = Attribute.objects.get(id=a)
                tam_name = attribute.name_at
                tam_value = attribute.value
                attribute.name_at = name
                attribute.value = value
                attribute.save()
                check = True
        if check.__eq__(True):
            return Response('Cập nhật thành công', status=status.HTTP_200_OK)
        else:
            return Response('Cập nhật không thành công', status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            product = self.queryset.get(pk=pk)
            serializer = self.serializer_class(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)

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
        names = request.data.getlist('name_at[]')
        values = request.data.getlist('value[]')
        attributes = []
        for name_att, value_att in zip(names, values):
            attribute, created = Attribute.objects.get_or_create(name_at=name_att, value=value_att, product=product)
            attributes.append(attribute)
        return Response(serializers.AttributeSerializer(attributes, many=True, context={'request': request}).data)

    @action(methods=['post'], detail=True)
    def add_image_in_product(self, request, pk):
        user = request.user
        imgs = request.FILES.getlist('thumbnail')
        product_id = self.get_object()

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
    def get_query(self, request):
        query = self.queryset
        key = self.request.query_params.get("key")
        if key:
            query = query.filter(Q(name_product__icontains=key) | Q(store__name_store__icontains=key))
        serializer = ProductSerializer(query, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

    @action(methods=['GET'], detail=True)
    def count_product_bought(self, request, pk):
        product = Product.objects.get(pk=pk)
        product_bought = OrderDetail.objects.filter(product=product).aggregate(Sum('quantity'))['quantity__sum'] or 0
        return Response({'product_bought': product_bought})

    @action(methods=['GET'], detail=True)
    def avg_rating(self, request, pk):
        product = Product.objects.get(pk=pk)
        #  rating__range=(1, 5))  lọc các đánh giá có rating từ 1 đến 5
        avg_rating = CommentProduct.objects.filter(orderDetail__product=product, rating__range=(1, 5)) \
            .aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        # làm tròn đến 1 chữ số thập phân
        rounded_avg_rating = round(avg_rating, 1) if avg_rating is not None else 0
        return Response({'avg_rating': rounded_avg_rating})

    @action(methods=['GET'], detail=True)
    def count_comment_product(self, request, pk):
        product = Product.objects.get(pk=pk)
        count = CommentProduct.objects.filter(orderDetail__product=product).aggregate(comment=Count('id'))
        return Response({'count': count})


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    parser_classes = [parsers.MultiPartParser]


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
        # if request.user.is_authenticated and request.user.role_id == 2:

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

    # else:
    #     return Response('Bạn Không có quyền mua hàng')

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


class StoreViewSet(viewsets.ViewSet, generics.ListAPIView,
                   generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Store.objects.all()
    serializer_class = serializers.StoreSerializer

    # permission_classes = [permissions.IsAuthenticated]
    def retrieve(self, request, pk=None):
        try:
            store = self.queryset.get(pk=pk)
            serializer = self.serializer_class(store)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def create_store(self, request):
        user = request.user
        store_name = request.data.get('name_store')
        address = request.data.get('address')
        avt = request.data.get('avt')
        if user.role_id != 3:
            account = Account.objects.get(pk=user.id)
            role = UserRole.objects.get(pk=3)
            store = Store.objects.create(name_store=store_name, address=address, active=0, account=account, avt=avt)
            account.role_id = role
            account.save()
            store.save()
            return Response(serializers.StoreSerializer(store).data, status=status.HTTP_200_OK)
        else:
            account = Account.objects.get(pk=user.id)
            store = Store.objects.create(name_store=store_name, address=address, active=0, account=account, avt=avt)
            store.save()
            return Response(serializers.StoreSerializer(store).data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def add_product(self, request, pk):
        # user = request.user
        store = self.get_object()
        category_id = int(request.data.get('category_id'))
        quantity = int(request.data.get('quantity'))
        description = request.data.get('description')
        name_product = request.data.get('name_product')
        price = float(request.data.get('price'))
        if not quantity or not name_product or not description or not price:
            return Response({'error': 'Thông tin sản phẩm không đủ'}, status=status.HTTP_400_BAD_REQUEST)
        category = Category.objects.get(pk=category_id)
        product = Product.objects.create(name_product=name_product, store=store, category=category,
                                         quantity=quantity, description=description, price=price)
        product.save()
        return Response(serializers.ProductSerializer(product).data, status=status.HTTP_201_CREATED)

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
        product_id = request.query_params.get('product_id')
        year_select = request.query_params.get('year')
        year = int(year_select) if year_select else None
        pro_revenue = dao.product_revenue_statistics_in_month(pk, product_id, year)
        if pro_revenue is not None:
            for c in pro_revenue:
                data.append({
                    'id': c.get('id'),
                    'name_product': c.get('name_product'),
                    'total_revenue': c.get('total_revenue'),
                    'total_quantity': c.get('total_quantity')
                })
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(methods=['GET'], detail=True)
    def product_revenue_in_year(self, request, pk):
        data = []
        year_select = request.query_params.get('year')
        year = int(year_select) if year_select else None
        product_id = request.query_params.get('product_id')
        pro_revenue = dao.product_revenue_statistics_in_year(pk, year, product_id)
        if pro_revenue is not None:
            for c in pro_revenue:
                data.append({
                    'id': c.get('id'),
                    'name_product': c.get('name_product'),
                    'total_revenue': c.get('total_revenue'),
                    'total_quantity': c.get('total_quantity')
                })
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(methods=['GET'], detail=True)
    def product_revenue_in_quarter(self, request, pk):
        data = []
        year_select = request.query_params.get('year')
        year = int(year_select) if year_select else None
        product_id = request.query_params.get('product_id')
        pro_revenue = dao.product_revenue_statistics_in_quarter(pk, year, product_id)
        if pro_revenue is not None:
            for c in pro_revenue:
                data.append({
                    'id': c.get('id'),
                    'name_product': c.get('name_product'),
                    'total_revenue': c.get('total_revenue'),
                    'total_quantity': c.get('total_quantity')
                })
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(methods=['GET'], detail=True)
    def category_revenue_in_month(self, request, pk):
        data = []
        year_select = request.query_params.get('year')
        category_id = request.query_params.get('category_id')
        year = int(year_select) if year_select else None
        cate_revenue = dao.category_revenue_statistics_in_month(pk, year, category_id)
        if cate_revenue is not None:
            for c in cate_revenue:
                data.append({
                    'id': c.get('id'),
                    'name_category': c.get('name_category'),
                    'total_revenue': c.get('total_revenue'),
                    'total_quantity': c.get('total_quantity'),
                    'month': c.get('month')
                })
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(methods=['GET'], detail=True)
    def category_revenue_in_year(self, request, pk):
        data = []
        year_select = request.query_params.get('year')
        category_id = request.query_params.get('category_id')
        year = int(year_select) if year_select else None
        cate_revenue = dao.category_revenue_statistics_in_year(pk, year, category_id)
        if cate_revenue is not None:
            for c in cate_revenue:
                data.append({
                    'id': c.get('id'),
                    'name_category': c.get('name_category'),
                    'total_revenue': c.get('total_revenue'),
                    'total_quantity': c.get('total_quantity'),
                    'year': c.get('year')
                })
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(methods=['GET'], detail=True)
    def category_revenue_in_quarter(self, request, pk):
        data = []
        year_select = request.query_params.get('year')
        category_id = request.query_params.get('category_id')
        year = int(year_select) if year_select else None
        cate_revenue = dao.category_revenue_statistics_in_quarter(pk, year, category_id)
        if cate_revenue is not None:
            for c in cate_revenue:
                data.append({
                    'id': c.get('id'),
                    'name_category': c.get('name_category'),
                    'total_revenue': c.get('total_revenue'),
                    'total_quantity': c.get('total_quantity'),
                })
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(methods=['POST'], detail=True)
    def add_follow(self, request, pk):
        store_id = self.get_object()
        follower_id = request.data.get('account_id')
        try:
            follower = Account.objects.get(pk=follower_id)
        except Account.DoesNotExist:
            return Response('Không tìm được tài khoản', status=status.HTTP_400_BAD_REQUEST)
        try:
            follow = Follow.objects.get(store=store_id, follower=follower)
            follow.delete()
            return Response('Đã hủy theo dõi cửa hàng', status=status.HTTP_200_OK)
        except:
            follow = Follow.objects.create(store=store_id, follower=follower)
            follow.save()
            return Response(serializers.FollowSerializer(follow).data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def get_store_to_confirm(self, request):
        store = Store.objects.filter(active=0)
        store_show = StoreSerializer(store, many=True)
        return Response(store_show.data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def confirm_store(self, request, pk):
        store = self.get_object()
        success_count = 0
        if store.active == 0:
            store.active = 1
            store.save()
            store_account_email = store.account.email
            store_account = store.account.full_name
            # breakpoint()
            subject = f"{store_account} có tin mới !!!"
            ten_nguoi_gui = 'Nhân Viên Sàn Thương Mại Điện Tử'

            html_content = f"""
                <p>Xin chào {store_account},</p>
                <p>Chúng tôi xin thông báo rằng cửa hàng của bạn đã được xác nhận thành công. Hiện tại bạn đã có thể đăng sản phẩm bán hàng.</p>   
                 """
            from_email = "nguyentoanmy112002@gmail.com"
            to = [store_account_email]

            try:
                with mail.get_connection() as connection:
                    msg = mail.EmailMessage(subject, html_content, from_email, to, connection=connection)
                    msg.content_subtype = "html"
                    success_count = msg.send()

                if success_count == 1:
                    return Response({'message': 'Email sent successfully.'}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                return Response({'message': f'Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response('Xác nhận cửa hàng thành công', status=status.HTTP_200_OK)
        else:
            return Response('Cửa hàng đã được xác nhận', status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['GET'], detail=True)
    def count_follower(self, request, pk):
        store = Store.objects.get(pk=pk)
        follower_count = Follow.objects.filter(store=store, follower__is_active=True).count()
        return Response({'count_follower': follower_count}, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def load_review_store(self, request, pk):
        data =[]
        store = Store.objects.get(pk=pk)
        product = Product.objects.filter(store=store)
        review = CommentProduct.objects.filter(orderDetail__product__in=product)
        for r in review:
            data.append({
                'product_name': r.orderDetail.product.name_product,
                'comment': r.content,
                'rating': r.rating,
            })
        return Response({'review': data})

    @action(methods=['GET'], detail=True)
    def avg_rating_store(self, request, pk):
        store = Store.objects.get(pk=pk)

        product = Product.objects.filter(store=store)
        # Tính trung bình rating của tất cả sản phẩm trong cửa hàng trong khoảng từ 1 đến 5
        avg_rating = CommentProduct.objects.filter(orderDetail__product__in=product) \
            .aggregate(Avg('rating'))['rating__avg'] or 0

        # Làm tròn giá trị trung bình đến 1 chữ số thập phân
        avg_rating = round(avg_rating, 1) if avg_rating else 0
        return Response({'avg_rating': avg_rating})


class OrderDetailViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = OrderDetail.objects.all()
    serializer_class = serializers.OderDetailSerializer

    @action(methods=['POST'], detail=True)
    def add_comment_product(self, request, pk):
        account_id = request.query_params.get('account_id')
        orderdetail_id = OrderDetail.objects.get(id=pk)
        rating_pro = int(request.data.get('rating'))
        content_pro = request.data.get('content')
        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response("Không tìm thấy tài khoản.", status=status.HTTP_400_BAD_REQUEST)

        if not content_pro or not rating_pro:
            return Response('Dữ liệu thiếu', status=status.HTTP_400_BAD_REQUEST)

        comment = CommentProduct.objects.create(rating=rating_pro, content=content_pro, account=account,
                                                orderDetail=orderdetail_id)
        comment.save()
        return Response(serializers.CommentProductSerializer(comment).data, status=status.HTTP_200_OK)


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


class CommentView(viewsets.ViewSet, generics.ListAPIView,
                  generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = CommentProduct.objects.all()
    serializer_class = serializers.CommentProductSerializer

    # permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [perms.OwnerAuth()]
        return [permissions.AllowAny()]

    def permissions_delete(self):
        if self.action in ['delete']:
            return [perms.OwnerAuth] or request.user.role_id != 3
        return [permissions.AllowAny]

    # thiếu điều kiện
    @action(methods=['POST'], detail=True)
    def reply_comment(self, request, pk):
        account_id = request.data.get('account_id')
        rating_pro = int(request.data.get('rating'))
        content_pro = request.data.get('content')
        reply_id = CommentProduct.objects.get(id=pk)
        orderdetail = int(request.data.get('orderdetail_id'))
        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response("Không tìm thấy tài khoản.", status=status.HTTP_400_BAD_REQUEST)
        try:
            orderdetail_id = OrderDetail.objects.get(id=orderdetail)
        except:
            return Response('Không tìm thấy orderdetail', status=status.HTTP_400_BAD_REQUEST)

        if not rating_pro or not content_pro:
            return Response('Dữ liệu thiếu', status=status.HTTP_400_BAD_REQUEST)

        comment = CommentProduct.objects.create(rating=rating_pro, content=content_pro, account=account,
                                                orderDetail=orderdetail_id, reply_idComment=reply_id)
        comment.save()
        return Response(serializers.CommentProductSerializer(comment).data, status=status.HTTP_200_OK)


class ReviewStoreView(viewsets.ViewSet, generics.ListAPIView):
    queryset = ReviewStore.objects.all()
    serializer_class = serializers.ReviewStoreSerialzer


class FollowViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer


class AttributeViewSet(viewsets.ViewSet, generics.ListAPIView, generics.DestroyAPIView):
    queryset = Attribute.objects.all()
    serializer_class = AttributeSerializer
