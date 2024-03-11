import hashlib
import hmac
import json
import random
import string
from datetime import datetime

import requests
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.core import mail
from django.db import models, transaction
from django.db.models import Sum, Avg, Q, Count
from django.http import JsonResponse, Http404
from django.shortcuts import redirect, get_list_or_404
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from unidecode import unidecode

from . import serializers, dao, perms
from .models import PaymentForm, Follow
from .models import Product, Category, Account, Image, UserRole, Order, Store, Attribute, PaymentType, ShippingType, \
    OrderDetail, CommentProduct, Bill
from .serializers import RoleSerializer, ProductSerializer, CategorySerializer, AccountSerializer, ImageSerializer, \
    AttributeSerializer, OrderSerializer, OrderDetailSerializer, CommentProductSerializer, \
    ProductWithCommentsSerializer, FollowSerializer, StoreSerializer, ProductQuantityUpdateSerializer, \
    CommentProductByUserSerializer
from .vnpayConfig import vnpay


class AccountViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    # RetrieveAPIView lay thong in user dang login
    queryset = Account.objects.filter(is_active=True)
    serializer_class = serializers.AccountSerializer  # serializer du lieu ra thanh json
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['post'], url_name='create-account', detail=False)
    def create_account(self, request):
        serializer = serializers.AccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    @action(methods=['patch'], detail=True)
    def update_account(self, request, pk=None):
        try:
            account = Account.objects.get(pk=pk)
            serializer = serializers.AccountSerializer(account, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Account.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# login google
def generate_random_string(length):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))


@csrf_exempt
def google_login(request):
    if request.method == 'POST':
        id_token_data = request.POST.get('idToken', None)
        display_name = request.POST.get('displayName', None)
        email = request.POST.get('email', None)
        uid = request.POST.get('uid', None)
        photo_url = request.POST.get('photoURL', None)

        print("Received data from client:")
        print("idToken:", id_token_data)
        print("displayName:", display_name)
        print("email:", email)
        print("uid:", uid)
        print("photoURL:", photo_url)
        if id_token_data:
            try:
                id_info = id_token.verify_oauth2_token(id_token_data, requests.Request())
                email = id_info['email']
                uid = id_info['sub']
                display_name = id_info['name']

                try:
                    user = Account.objects.get(social_user_id=uid)

                    user_data = {
                        'full_name': user.full_name,
                        'avt': str(user.avt),
                        'id': user.id,
                    }

                    return JsonResponse({'success': True, 'message': 'Login successful', 'user': user_data})
                except Account.DoesNotExist:

                    random_username = generate_random_string(10)

                    user = Account(
                        social_user_id=uid,
                        username=random_username,
                        email=email,
                        full_name=display_name,
                        role_id=3,
                        avt=photo_url
                    )
                    user.save()

                    user_data = {
                        'full_name': user.full_name,
                        'avt': str(user.avt),
                        'id': user.id,
                    }

                    return JsonResponse(
                        {'success': True, 'message': 'Account created and logged in', 'user': user_data})
            except Exception as e:
                print(f"Error processing request: {e}")
                return JsonResponse({'success': False, 'message': 'Error processing request'})
        return JsonResponse({'success': False, 'message': 'No idToken provided'})
    return JsonResponse({'success': False, 'message': 'Invalid request method'})


# login facebook
@csrf_exempt
def facebook_login(request, *args, **kwargs):
    if request.method == 'POST':
        try:
            display_name = request.POST.get('displayName', None)
            uid = request.POST.get('uid', None)
            photo_url = request.POST.get('photoURL', None)

            if uid:
                try:
                    user = Account.objects.get(social_user_id=uid)

                    user_data = {
                        'full_name': user.full_name,
                        'avt': str(user.avt),
                        'id': user.id,
                    }

                    return JsonResponse({'success': True, 'message': 'Login successful', 'user': user_data})
                except Account.DoesNotExist:
                    pass

            random_username = generate_random_string(10)

            user = Account(
                social_user_id=uid,
                username=random_username,
                full_name=display_name,
                role_id=3,
                avt=photo_url
            )
            user.save()

            user_data = {
                'full_name': user.full_name,
                'avt': str(user.avt),
                'id': user.id,
            }

            return JsonResponse(
                {'success': True, 'message': 'Account created and logged in', 'user': user_data})
        except Exception as e:
            return JsonResponse({'success': False, 'message': 'Error processing request'})
    else:
        return JsonResponse({'success': False, 'message': 'Invalid request method'})


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # permission_classes = [permissions.IsAuthenticated]


class ProductPagination(PageNumberPagination):
    page_size = 6

class ProductViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    # permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['GET'])
    def get_comments_for_product(self, request, pk=None):
        try:
            product = Product.objects.get(id=pk)

            comments = CommentProduct.objects.filter(
                orderDetail__product=product, reply_idComment=None
            )

            comments_and_replies = []
            for comment in comments:
                comment_data = CommentProductSerializer(comment).data
                replies = CommentProduct.objects.filter(reply_idComment=comment.id)
                reply_data = CommentProductSerializer(replies, many=True).data
                comment_data['replies'] = reply_data
                comments_and_replies.append(comment_data)

            product_serializer = ProductWithCommentsSerializer(product)

            return Response({'product': product_serializer.data, 'comments': comments_and_replies})
        except Product.DoesNotExist:
            return Response({'error': 'Sản phẩm không tồn tại'}, status=404)

    def quantitySold_avgRating_countCmt(self, product_data):
        product_id = product_data['id']

        # quantity
        quantity_sold = OrderDetail.objects.filter(
            product_id=product_id,
            order__status_pay=True
        ).aggregate(Sum('quantity'))['quantity__sum'] or 0
        product_data['quantity_sold'] = quantity_sold

        # avg_rating
        avg_rating = CommentProduct.objects.filter(orderDetail__product_id=product_id, rating__range=(1, 5)) \
                         .aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        product_data['avg_rating'] = round(avg_rating, 1) if avg_rating is not None else 0

        # count_cmtProduct
        count_cmt = CommentProduct.objects.filter(orderDetail__product_id=product_id).count()
        product_data['count_cmtProduct'] = count_cmt

    def list(self, request, *args, **kwargs):
        queryset = Product.objects.filter(quantity__gt=0, status=True)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = ProductSerializer(page, many=True)
            serialized_data = [{"product": product_data} for product_data in serializer.data]

            for product_data in serialized_data:
                self.quantitySold_avgRating_countCmt(product_data['product'])

            return self.get_paginated_response(serialized_data)

        serializer = ProductSerializer(queryset, many=True)
        serialized_data = [{"product": product_data} for product_data in serializer.data]

        for product_data in serialized_data:
            self.quantitySold_avgRating_countCmt(product_data['product'])

        return Response(serialized_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def list_product_bySearch(self, request, *args, **kwargs):
        queryset = Product.objects.filter(quantity__gt=0, status=True)
        serializer = ProductSerializer(queryset, many=True)

        serialized_data = [{"product": product_data} for product_data in serializer.data]

        for product_data in serialized_data:
            self.quantitySold_avgRating_countCmt(product_data['product'])

        return Response(serialized_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def get_query(self, request):
        kw = request.query_params.get('kw', None)
        if not kw:
            return Response({'error': 'Missing search term'}, status=status.HTTP_400_BAD_REQUEST)

        kw = kw.strip().lower()
        query = self.queryset.filter(
            models.Q(name_product__icontains=kw) | models.Q(store__name_store__icontains=kw)
        )

        serializer_data = [{"product": product_data} for product_data in ProductSerializer(query, many=True).data]

        for product_data in serializer_data:
            self.quantitySold_avgRating_countCmt(product_data['product'])

        return Response(serializer_data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        try:
            product = self.queryset.get(pk=pk)
            serializer = self.serializer_class(product)

            product_data = serializer.data
            self.quantitySold_avgRating_countCmt(product_data)

            return Response(product_data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)

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
        if quantity is not None:
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
                if i and i != 'undefined':
                    image = Image.objects.get(id=i)
                    tam_img = image.thumbnail
                    image.thumbnail = img
                    image.save()
                    check = True
                else:
                    new_image = Image.objects.create(thumbnail=img, product=p)
                    check = True
        if att:
            for a, name, value in zip(att, names, values):
                if a and a != 'undefined':
                    attribute = Attribute.objects.get(id=a)
                    tam_name = attribute.name_at
                    tam_value = attribute.value
                    attribute.name_at = name
                    attribute.value = value
                    attribute.save()
                    check = True
                else:
                    new_attribute = Attribute.objects.create(name_at=name, value=value, product=p)
                    check = True
        if check.__eq__(True):
            return Response('Cập nhật thành công', status=status.HTTP_200_OK)
        else:
            return Response('Cập nhật không thành công', status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['PATCH'], detail=True)
    def update_quantity(self, request, pk):
        product = self.get_object()

        if product.quantity == 0:
            serializer = ProductQuantityUpdateSerializer(data=request.data)

            if serializer.is_valid():
                new_quantity = serializer.validated_data['quantity']
                product.quantity = new_quantity
                product.save()
                return Response('Quantity update thành công', status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response('Product quantity phải bằng 0', status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=True)
    def add_attribute(self, request, pk):
        product = self.get_object()
        names = request.data.getlist('name_at[]')
        values = request.data.getlist('value[]')
        attributes = []
        for name_att, value_att in zip(names, values):
            attribute, created = Attribute.objects.get_or_create(name_at=name_att, value=value_att, product=product)
            attributes.append(attribute)
        return Response(serializers.AttributeSerializer(attributes, many=True, context={'request': request}).data)

    @action(methods=['POST'], detail=True)
    def add_image(self, request, pk):
        user = request.user
        imgs = request.FILES.getlist('thumbnail')

        if not imgs:
            return Response("Images are required.", status=status.HTTP_400_BAD_REQUEST)

        try:
            product = self.get_object()
        except Product.DoesNotExist:
            return Response("Product does not exist.", status=status.HTTP_400_BAD_REQUEST)

        check = False
        for img in imgs:
            image = Image.objects.create(thumbnail=img, product=product)
            image.save()
            check = True

        if check:
            return Response("Successfully added images", status=status.HTTP_200_OK)
        else:
            return Response('Failed to add images', status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['GET'], detail=False)
    def get_product_by_category(self, request):
        pro = []
        id_category = request.query_params.get('category')
        try:
            products = Product.objects.filter(category=id_category)
        except:
            return Response('Không có sản phẩm nào', status=status.HTTP_400_BAD_REQUEST)

        for product in products:
            product_data = {
                'id': product.id,
                'name_product': product.name_product,
                # 'price': product.price,
                # 'quantity': product.quantity
            }

            self.quantitySold_avgRating_countCmt(product_data)
            pro.append(product_data)

        return Response(pro, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def compare_product(self, request):
        id_product_1 = request.query_params.get('id_1')
        id_product_2 = request.query_params.get('id_2')
        category_id_1 = None
        category_id_2 = None

        try:
            product_1 = Product.objects.get(id=id_product_1)
            category_id_1 = product_1.category.id
            product_data_1 = ProductSerializer(product_1).data
            self.quantitySold_avgRating_countCmt(product_data_1)  # Pass serialized data
        except Product.DoesNotExist:
            raise Http404("Không tìm thấy sản phẩm 1")

        try:
            product_2 = Product.objects.get(id=id_product_2)
            category_id_2 = product_2.category.id
            product_data_2 = ProductSerializer(product_2).data
            self.quantitySold_avgRating_countCmt(product_data_2)  # Pass serialized data
        except Product.DoesNotExist:
            raise Http404("Không tìm thấy sản phẩm 2")

        if category_id_1 == category_id_2:
            return Response({'product_1': product_data_1, 'product_2': product_data_2}, status=status.HTTP_200_OK)
        else:
            return Response('Sản phẩm không thuộc cùng một danh mục', status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def sort_by_name(self, request):
        product_ids_str = request.POST.get('product_ids', '[]')
        product_ids = json.loads(product_ids_str)

        products = get_list_or_404(Product, id__in=product_ids)

        sorted_products = sorted(products, key=lambda x: unidecode(x.name_product).casefold())

        nested_data = [{"product": ProductSerializer(product).data} for product in sorted_products]

        for product_data in nested_data:
            self.quantitySold_avgRating_countCmt(product_data['product'])

        return JsonResponse(nested_data, safe=False)

    @action(methods=['POST'], detail=False)
    def sort_by_price_up(self, request):
        product_ids_str = request.POST.get('product_ids', '[]')
        product_ids = json.loads(product_ids_str)

        products = get_list_or_404(Product, id__in=product_ids)

        sorted_products = sorted(products, key=lambda x: x.price)
        serialized_data = [{"product": ProductSerializer(product).data} for product in sorted_products]

        for product_data in serialized_data:
            self.quantitySold_avgRating_countCmt(product_data['product'])

        return Response(serialized_data)

    @action(methods=['POST'], detail=False)
    def sort_by_price_down(self, request):
        product_ids_str = request.POST.get('product_ids', '[]')
        product_ids = json.loads(product_ids_str)

        products = get_list_or_404(Product, id__in=product_ids)

        sorted_products = sorted(products, key=lambda x: x.price, reverse=True)
        serialized_data = [{"product": ProductSerializer(product).data} for product in sorted_products]

        for product_data in serialized_data:
            self.quantitySold_avgRating_countCmt(product_data['product'])

        return Response(serialized_data)

    @action(methods=['POST'], detail=False)
    def sort_by_quantity_sold(self, request):
        try:
            product_ids_str = request.data.get('product_ids', '[]')
            product_ids = json.loads(product_ids_str)

            products = Product.objects.filter(id__in=product_ids)

            products_info = []

            for product in products:
                product_data = {"product": ProductSerializer(product).data}

                self.quantitySold_avgRating_countCmt(product_data['product'])

                products_info.append(product_data)

            products_info = sorted(products_info, key=lambda x: x['product']['quantity_sold'], reverse=True)

            return Response(products_info, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['POST'])
    def add_tag(self, request, pk=None):
        product = self.get_object()
        product.tag = True
        product.tag_start_date = request.data.get('tag_start_date')
        product.tag_end_date = request.data.get('tag_end_date')
        product.save()
        serializer = ProductSerializer(product)
        return Response({"product": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'])
    def remove_tag(self, request, pk=None):
        product = self.get_object()
        product.tag = False
        product.tag_start_date = None
        product.tag_end_date = None
        product.save()
        serializer = ProductSerializer(product)
        return Response({"product": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'])
    def comfirm_pruduct(self, request, pk=None):
        product = self.get_object()
        product.status = True
        product.save()
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AttributeViewSet(viewsets.ViewSet, generics.ListAPIView, generics.DestroyAPIView):
    queryset = Attribute.objects.all()
    serializer_class = AttributeSerializer


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    parser_classes = [parsers.MultiPartParser]

    # @action(methods=['post'], detail=True)
    # def add_image_in_product(self, request, pk):
    #     user = request.user
    #     imgs = request.FILES.getlist('thumbnail')
    #     product_id = int(request.data.get('product'))
    #
    #     if not imgs:
    #         return Response("Image is required.", status=status.HTTP_400_BAD_REQUEST)
    #
    #     try:
    #         product = Product.objects.get(id=product_id)
    #     except Product.DoesNotExist:
    #         return Response("Product does not exist.", status=status.HTTP_400_BAD_REQUEST)
    #
    #     check = False
    #     # self.serializer_class().push_images_for_house(house_id, new_image)
    #     for img in imgs:
    #         image = Image.objects.create(thumbnail=img, product=product)
    #         image.save()
    #         check = True
    #
    #     if check == True:
    #         return Response("Thanh cong roi nhe", status=status.HTTP_200_OK)
    #     else:
    #         return Response('loi roi do hoang', status=status.HTTP_400_BAD_REQUEST)


class RoleViewSet(viewsets.ViewSet,
                  generics.ListAPIView):
    queryset = UserRole.objects.all()
    serializer_class = RoleSerializer


class OrderViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(methods=['POST'], detail=False)
    def create_order(self, request):
        # user = request.user
        shipping_address = request.data.get('shipping_address')
        shipping_fee = request.data.get('shipping_fee')
        note = request.data.get('note')
        # status_pay = request.data.get('status_pay')
        # status_order = request.data.get('status_order')
        account = int(request.data.get('account_id'))
        paymentType_id = int(request.data.get('paymentType_id'))
        status_pay = 1 if paymentType_id == 1 else 0
        shippingType_id = int(request.data.get('shippingType_id'))
        if request.user.is_authenticated:
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
                                         status_pay=status_pay,
                                         status_order=0,
                                         account=account, paymentType=payment_type,
                                         shippingType=shipping_type)
            order.save()
            return Response(serializers.OrderSerializer(order).data, status=status.HTTP_200_OK)
        else:
            return Response('Bạn Không có quyền mua hàng')

    @action(methods=['POST'], detail=True)
    def create_orderdetail(self, request, pk):
        order_id = Order.objects.get(pk=pk)
        product_ids = request.data.getlist('product_id[]')
        quantities = request.data.getlist('quantity[]')
        orderdetails = []
        total = 0

        for product_id, quantity_pro in zip(product_ids, quantities):
            product = Product.objects.get(pk=product_id)

            if product.quantity < int(quantity_pro):
                return Response({'error': 'Không đủ số lượng sản phẩm trong kho'}, status=status.HTTP_400_BAD_REQUEST)

            orderdetail, created = OrderDetail.objects.get_or_create(product=product, quantity=quantity_pro,
                                                                     order=order_id)

            product.quantity -= int(quantity_pro)
            product.save()

            total_price = product.price * int(quantity_pro)
            total += total_price
            orderdetails.append(orderdetail)

        return Response({'order_detail': OrderDetailSerializer(orderdetails, many=True).data, 'total': total})

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

    @action(detail=False, methods=['GET'])
    def get_orders_noConfirm_by_account(self, request):
        account_id = request.query_params.get('account_id')

        if not account_id:
            return Response({'error': 'Missing account ID'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

        orders = Order.objects.filter(account=account, status_order=False).order_by('-id')
        order_details_data = []

        for order in orders:
            order_details = OrderDetail.objects.filter(order=order)
            serialized_order_details = OrderDetailSerializer(order_details, many=True).data

            bill = Bill.objects.filter(order=order).first()
            bill_data = {'total_amount': bill.total_amount if bill else None}

            order_data = {
                'id': order.id,
                'shipping_address': order.shipping_address,
                'note': order.note,
                'shipping_fee': order.shipping_fee,
                'status_pay': order.status_pay,
                'status_order': order.status_order,
                'created_at': order.created_at,
                'paymentType': order.paymentType.id,
                'shippingType': order.shippingType.id,
                'order_details': serialized_order_details,
                'bill_info': bill_data,
            }

            order_details_data.append(order_data)

        return Response(order_details_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def get_orders_confirm_by_account(self, request):
        account_id = request.query_params.get('account_id')

        if not account_id:
            return Response({'error': 'Missing account ID'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

        orders = Order.objects.filter(account=account, status_order=True).order_by('-id')
        order_details_data = []

        for order in orders:
            order_details = OrderDetail.objects.filter(order=order)
            serialized_order_details = OrderDetailSerializer(order_details, many=True).data

            bill = Bill.objects.filter(order=order).first()
            bill_data = {'total_amount': bill.total_amount if bill else None}

            order_data = {
                'id': order.id,
                'shipping_address': order.shipping_address,
                'note': order.note,
                'shipping_fee': order.shipping_fee,
                'status_pay': order.status_pay,
                'status_order': order.status_order,
                'created_at': order.created_at,
                'paymentType': order.paymentType.id,
                'shippingType': order.shippingType.id,
                'order_details': serialized_order_details,
                'bill_info': bill_data,
            }

            order_details_data.append(order_data)

        return Response(order_details_data, status=status.HTTP_200_OK)


class OrderDetailViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = OrderDetail.objects.all()
    serializer_class = serializers.OrderDetailSerializer


class BillViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Bill.objects.all()
    serializer_class = serializers.BillSerializer

    # random bill
    @staticmethod
    def generate_random_code(length=17):
        characters = string.ascii_letters + string.digits
        return ''.join(random.choice(characters) for i in range(length))

    @action(methods=['POST'], detail=False)
    def create_bill(self, request):
        try:
            total_amount = float(request.data.get('total_amount', 0))
            order_id = int(request.data.get('order_id', 0))

            with transaction.atomic():
                bill_code = self.generate_random_code()
                bill_transactionNo = self.generate_random_code()

                bill = Bill.objects.create(
                    bill_code=bill_code,
                    bill_transactionNo=bill_transactionNo,
                    total_amount=total_amount,
                    order_id=order_id
                )

                return Response(serializers.BillSerializer(bill).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StoreViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Store.objects.all()
    serializer_class = serializers.StoreSerializer

    @action(detail=False, methods=['get'])
    def get_product_statusFalse(self, request):
        stores = Store.objects.annotate(
            product_false_count=Count('product', filter=models.Q(product__status=False))
        ).filter(product_false_count__gt=0)
        serializer = serializers.ProductFalse_ByStoreSerializer(stores, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def list_products_tag(self, request, pk=None):
        try:
            store = Store.objects.get(id=pk)
            products = Product.objects.filter(store=store, status=True, quantity__gt=0).order_by('tag')
            serializer = ProductSerializer(products, many=True)

            serialized_data = [product_data for product_data in serializer.data]

            return Response(serialized_data, status=status.HTTP_200_OK)
        except Store.DoesNotExist:
            return Response({'error': 'Cửa hàng không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def get_revenue_store(self, request, pk=None):
        store_id = self.kwargs.get('pk', None)

        order_details = OrderDetail.objects.filter(product__store__id=store_id)
        order_ids = order_details.values_list('order__id', flat=True)

        total_revenue = Bill.objects.filter(order__id__in=order_ids).aggregate(Sum('total_amount'))[
                            'total_amount__sum'] or 0

        return Response({'store_id': store_id, 'total_revenue': total_revenue})

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

    @action(methods=['GET'], detail=True)
    def count_follower(self, request, pk):
        store = Store.objects.get(pk=pk)
        follower_count = Follow.objects.filter(store=store, follower__is_active=True).count()
        return Response({'count_follower': follower_count}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        try:
            store = self.queryset.get(pk=pk)
            serializer = self.serializer_class(store)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['GET'])
    def get_products_by_store(self, request, pk=None):
        try:
            store = Store.objects.get(id=pk)
            products = Product.objects.filter(store=store, status=True)

            products_data = []
            for product in products:
                product_serializer = ProductWithCommentsSerializer(product)

                quantity_sold = OrderDetail.objects.filter(
                    product_id=product.id,
                    order__status_pay=True
                ).aggregate(Sum('quantity'))['quantity__sum'] or 0

                avg_rating = CommentProduct.objects.filter(orderDetail__product_id=product.id, rating__range=(1, 5)) \
                                 .aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
                avg_rating = round(avg_rating, 1) if avg_rating is not None else 0

                comments = CommentProduct.objects.filter(orderDetail__product=product)
                comments_serializer = CommentProductSerializer(comments, many=True)

                product_data = {
                    'product': product_serializer.data,
                    'comments': comments_serializer.data,
                    'quantity_sold': quantity_sold,
                    'avg_rating': avg_rating
                }

                products_data.append(product_data)

            return Response(products_data)
        except Store.DoesNotExist:
            return Response({'error': 'Cửa hàng không tồn tại'}, status=404)

    @action(detail=True, methods=['PATCH'])
    def update_order_status(self, request, pk=None):
        store = self.get_object()

        if not store:
            return Response({'error': 'Cửa hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        order_id = request.query_params.get('order_id')
        try:
            order = Order.objects.filter(pk=order_id, status_order=False).order_by('-id').first()
        except Order.DoesNotExist:
            return Response({'error': 'Đơn hàng không tồn tại hoặc đã được xác nhận.'},
                            status=status.HTTP_404_NOT_FOUND)

        order.status_order = True
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'])
    def get_orders_status_order_false(self, request, pk=None):
        store = self.get_object()

        if not store:
            return Response({'error': 'Cửa hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        product_ids = OrderDetail.objects.filter(product__store=store).values_list('product_id', flat=True)

        orders = Order.objects.filter(
            id__in=OrderDetail.objects.filter(product_id__in=product_ids).values_list('order_id', flat=True),
            status_order=False).order_by('-id')

        orders_info = []
        for order in orders:
            order_details = OrderDetail.objects.filter(order=order)
            order_details_serializer = OrderDetailSerializer(order_details, many=True)
            order_serializer = OrderSerializer(order)
            orders_info.append({'order_info': order_serializer.data, 'order_details': order_details_serializer.data})

        return JsonResponse(orders_info, status=status.HTTP_200_OK, safe=False)

    @action(detail=True, methods=['GET'])
    def get_orders_status_order_status_pay_true(self, request, pk=None):
        store = self.get_object()

        if not store:
            return Response({'error': 'Cửa hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        product_ids = OrderDetail.objects.filter(product__store=store).values_list('product_id', flat=True)

        orders = Order.objects.filter(
            id__in=OrderDetail.objects.filter(product_id__in=product_ids).values_list('order_id', flat=True),
            status_order=True,
            status_pay=True
        ).order_by('-id')

        orders_info = []
        for order in orders:
            order_details = OrderDetail.objects.filter(order=order)
            order_details_serializer = OrderDetailSerializer(order_details, many=True)
            order_serializer = OrderSerializer(order)
            orders_info.append({'order_info': order_serializer.data, 'order_details': order_details_serializer.data})

        return JsonResponse(orders_info, status=status.HTTP_200_OK, safe=False)

    @action(detail=True, methods=['GET'])
    def count_orders_and_comments(self, request, pk=None):
        store = self.get_object()

        if not store:
            return Response({'error': 'Cửa hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        id_store = pk

        product_ids = OrderDetail.objects.filter(
            product__store__id=id_store
        ).values_list('product_id', flat=True)

        order_ids = OrderDetail.objects.filter(
            product_id__in=product_ids
        ).values_list('order_id', flat=True)

        count_orders = Order.objects.filter(
            Q(id__in=order_ids) & Q(status_order=False)
        ).count()

        count_comments = CommentProduct.objects.filter(
            orderDetail__product__store=store
        ).count()

        return Response({'count_orders': count_orders, 'count_comments': count_comments}, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def get_products_by_store_true(self, request, pk=None):
        store = self.get_object()

        if not store:
            return Response({'error': 'Cửa hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        products = Product.objects.filter(store=store, status=True, quantity__gt=0)

        products_data = []
        for product in products:
            product_serializer = serializers.ProductSerializer(product)

            quantity_sold = OrderDetail.objects.filter(
                product_id=product.id,
                order__status_pay=True
            ).aggregate(Sum('quantity'))['quantity__sum'] or 0

            avg_rating = CommentProduct.objects.filter(orderDetail__product_id=product.id, rating__range=(1, 5)) \
                             .aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
            avg_rating = round(avg_rating, 1) if avg_rating is not None else 0

            comments = CommentProduct.objects.filter(orderDetail__product=product)
            # comments_serializer = CommentProductSerializer(comments, many=True)

            product_data = {
                'product': product_serializer.data,
                # 'comments': comments_serializer.data,
                'quantity_sold': quantity_sold,
                'avg_rating': avg_rating
            }

            products_data.append(product_data)

        return Response(products_data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def get_products_by_store_false(self, request, pk=None):
        store = self.get_object()

        if not store:
            return Response({'error': 'Cửa hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        products = Product.objects.filter(store=store, status=False)
        serializer = serializers.ProductSerializer(products, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def get_products_by_store_soldOut(self, request, pk=None):
        store = self.get_object()

        if not store:
            return Response({'error': 'Cửa hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        products = Product.objects.filter(store=store, quantity=0, status=True)
        serializer = serializers.ProductSerializer(products, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True)
    def get_categories_by_store(self, request, pk=None):
        store = self.get_object()

        if not store:
            return Response({'error': 'Cửa hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        categories = Category.objects.filter(products__store=store).distinct()
        serializer = CategorySerializer(categories, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False)
    def create_store(self, request):
        user = request.user
        idUser = request.data.get('user', None)
        account = Account.objects.get(id=idUser)
        if account.social_user_id is not None:
            existing_store = Store.objects.filter(account=idUser)

            if existing_store.exists():
                return Response({'error': 'Bạn đã có một cửa hàng.'}, status=status.HTTP_400_BAD_REQUEST)

            store_data = request.data.copy()

            store_data['account'] = idUser
            serializer = serializers.StoreSerializer(data=store_data)

            if serializer.is_valid():
                serializer.save()
                account.role_id = 2
                account.save()

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # social_user_id là null
        elif isinstance(user, AnonymousUser):
            return Response({'error': 'Người dùng không hợp lệ.'}, status=status.HTTP_401_UNAUTHORIZED)

        existing_store = Store.objects.filter(account=user)

        if existing_store.exists():
            return Response({'error': 'Bạn đã có một cửa hàng.'}, status=status.HTTP_400_BAD_REQUEST)

        store_data = request.data.copy()

        store_data['account'] = user.id
        serializer = serializers.StoreSerializer(data=store_data)

        if serializer.is_valid():
            serializer.save()
            user.role_id = 2
            user.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=True)
    def add_product(self, request, pk=None):
        user = request.user
        idStore = pk
        store = Store.objects.get(id=idStore)

        category = int(request.data.get('category_id'))
        quantity = int(request.data.get('quantity'))
        description = request.data.get('description')
        name_product = request.data.get('name_product')
        price = float(request.data.get('price'))
        # status_pro = request.data.get('status', False)

        if store.account.social_user_id is not None:

            if not quantity or not name_product or not description or not price:
                return Response({'error': 'Thông tin sản phẩm không đủ'}, status=status.HTTP_400_BAD_REQUEST)

            if not store:
                return Response({'error': 'Bạn không có cửa hàng để thêm sản phẩm'}, status=status.HTTP_404_NOT_FOUND)

            category = Category.objects.get(pk=category)
            if not category:
                return Response({'error': 'Bạn không có lọai mặt hàng'}, status=status.HTTP_404_NOT_FOUND)

            product = Product.objects.create(name_product=name_product, store=store, category=category,
                                             quantity=quantity, description=description, price=price)
            product.save()
            return Response(serializers.ProductSerializer(product).data, status=status.HTTP_201_CREATED)

        if user.is_authenticated and user.role_id == 2:

            if not quantity or not name_product or not description or not price:
                return Response({'error': 'Thông tin sản phẩm không đủ'}, status=status.HTTP_400_BAD_REQUEST)

            if not store:
                return Response({'error': 'Bạn không có cửa hàng để thêm sản phẩm'}, status=status.HTTP_404_NOT_FOUND)

            category = Category.objects.get(pk=category)
            if not category:
                return Response({'error': 'Bạn không có lọai mặt hàng'}, status=status.HTTP_404_NOT_FOUND)

            product = Product.objects.create(name_product=name_product, store=store, category=category,
                                             quantity=quantity, description=description, price=price, tag=False)
            product.save()
            return Response(serializers.ProductSerializer(product).data, status=status.HTTP_201_CREATED)

        return Response({'error': 'Bạn không có quyền thêm sản phẩm.'}, status=status.HTTP_403_FORBIDDEN)

    # stats product store
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

    # stats category store
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

    # confirm store
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
            subject = f"[NO REPLY] E-CommerceSystem send email confirm Store"

            html_content = f"""
                <p>Xin chào {store_account},</p>
                <p>Cửa hàng [{store.name_store}] đã được xác nhận thành công. Hiện tại bạn đã có thể đăng sản phẩm bán hàng!</p>   
                <p>Chúc bạn một ngày tốt lành.</p>   
                 """
            from_email = "healthcouchhcm@gmail.com"
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

    @action(methods=['GET'], detail=False)
    def get_list_store_stats(self, request):
        store = Store.objects.filter(active=1)
        store_show = StoreSerializer(store, many=True)
        return Response(store_show.data, status=status.HTTP_200_OK)

    # stats total product manager
    @action(detail=True, methods=['GET'])
    def product_count_in_month(self, request, pk):
        store = self.get_object()

        year = request.query_params.get('year', None)

        year = int(year)

        response_data = dao.product_count_statistics_in_month(store, year)

        return Response(response_data)

    @action(detail=True, methods=['GET'])
    def product_count_in_quarter(self, request, pk):
        store = self.get_object()

        year = request.query_params.get('year', None)

        year = int(year)

        response_data = dao.product_count_statistics_in_quarter(store, year)

        return Response(response_data)

    # stats count order
    @action(detail=True, methods=['GET'])
    def get_order_count_month(self, request, pk):
        store_id = self.get_object()
        year = request.query_params.get('year')
        order_counts = dao.order_count_statistics_in_month(store_id, year)
        data = []
        for count in order_counts['monthly_stats']:
            store_data = {
                'month': count['month'],
                'total_orders': count['total_orders'],
                'order_info': count['order_info'],
            }
            data.append(store_data)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'])
    def get_order_count_quarter(self, request, pk):
        store_id = self.get_object()
        year = request.query_params.get('year')
        order_counts = dao.order_count_statistics_in_quarter(store_id, year)
        data = []
        for count in order_counts['quarterly_stats']:
            store_data = {
                'quarter': count['quarter'],
                'total_orders': count['total_orders'],
                'order_info': count['order_info'],
            }
            data.append(store_data)
        return Response(data, status=status.HTTP_200_OK)


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

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [perms.OwnerAuth()]
        return [permissions.AllowAny()]

    def delete_permissions(self, request):
        if self.action == 'destroy':
            comment = self.get_object()
            if not comment.is_comment_owner(request.user):
                return False
        return True

    def destroy(self, request, *args, **kwargs):
        if not self.delete_permissions(request):
            return Response("Bạn không có quyền thực hiện hành động này.", status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['GET'])
    def comments_get_byUser(self, request):
        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response({'error': 'user_id is required in FormData'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = int(user_id)
        except ValueError:
            return Response({'error': 'Invalid user_id format'}, status=status.HTTP_400_BAD_REQUEST)

        comments = CommentProduct.objects.filter(account=user_id, reply_idComment__isnull=True)

        comment_serializer = CommentProductByUserSerializer(comments, many=True)

        return Response({
            'comments': comment_serializer.data,
        }, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def add_comment_product(self, request, pk):
        account_id = request.user.id

        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response("Không tìm thấy tài khoản.", status=status.HTTP_400_BAD_REQUEST)

        orderdetail_id = OrderDetail.objects.get(id=pk)
        rating_pro = int(request.data.get('rating'))
        content_pro = request.data.get('content')

        if not content_pro or not rating_pro:
            return Response('Dữ liệu thiếu', status=status.HTTP_400_BAD_REQUEST)

        # transaction để đảm bảo tính nhất quán giữa việc add comment và update orderDetail
        with transaction.atomic():
            comment = CommentProduct.objects.create(rating=rating_pro, content=content_pro, account=account,
                                                    orderDetail=orderdetail_id)
            comment.save()

            orderdetail_id.status_review = True
            orderdetail_id.save()

        return Response(serializers.CommentProductSerializer(comment).data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def reply_to_comment(self, request, pk):
        if not self.get_permissions():
            return Response("Bạn không có quyền thực hiện hành động này.", status=status.HTTP_403_FORBIDDEN)

        original_comment = self.get_object()

        if not original_comment.is_shop_owner(request.user):
            return Response("Chỉ chủ cửa hàng mới có thể trả lời bình luận.", status=status.HTTP_403_FORBIDDEN)

        reply_content = request.data.get('reply_content')
        if not reply_content:
            return Response("Nội dung trả lời bình luận không được để trống.", status=status.HTTP_400_BAD_REQUEST)

        original_order_detail = original_comment.orderDetail

        # transaction để đảm bảo tính nhất quán giữa việc add comment và update orderDetail
        with transaction.atomic():
            reply_comment = CommentProduct.objects.create(
                rating=original_comment.rating,
                content=reply_content,
                account=request.user,
                reply_idComment=original_comment,
                orderDetail=original_order_detail
            )

        return Response(serializers.CommentProductSerializer(reply_comment).data, status=status.HTTP_201_CREATED)

    @action(methods=['PATCH'], detail=True)
    def update_comment(self, request, pk):
        if not self.get_permissions():
            return Response("Bạn không có quyền thực hiện hành động này.", status=status.HTTP_403_FORBIDDEN)

        comment = self.get_object()

        if not comment.is_comment_owner(request.user):
            return Response("Bạn không có quyền cập nhật bình luận này.", status=status.HTTP_403_FORBIDDEN)

        new_content = request.data.get('new_content')
        if not new_content:
            return Response("Nội dung cập nhật không được để trống.", status=status.HTTP_400_BAD_REQUEST)

        comment.content = new_content
        comment.save()
        return Response(serializers.CommentProductSerializer(comment).data, status=status.HTTP_200_OK)

    @action(methods=['DELETE'], detail=True)
    def delete_comment(self, request, pk):
        if not self.delete_permissions(request):
            return Response("Bạn không có quyền thực hiện hành động này.", status=status.HTTP_403_FORBIDDEN)

        comment = self.get_object()

        if not comment.is_comment_owner(request.user):
            return Response("Bạn không có quyền xóa bình luận này.", status=status.HTTP_403_FORBIDDEN)

        comment.delete()
        return Response("Bình luận đã được xóa thành công.", status=status.HTTP_200_OK)


#
# class ReviewStoreView(viewsets.ViewSet, generics.ListAPIView):
#     queryset = ReviewStore.objects.all()
#     serializer_class = serializers.ReviewStoreSerialzer


class FollowViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer

    @action(methods=['POST'], detail=False)
    def get_list_follow_byUser(self, request, *args, **kwargs):
        user_id = request.data.get('account_id')
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Account.objects.get(pk=user_id)
            followed_stores = Follow.objects.filter(follower=user)
            serializer = FollowSerializer(followed_stores, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Account.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# vnpay
def index(request):
    return render(request, "vnpay/index.html", {"title": "Danh sách demo"})


def hmacsha512(key, data):
    byteKey = key.encode('utf-8')
    byteData = data.encode('utf-8')
    return hmac.new(byteKey, byteData, hashlib.sha512).hexdigest()


def payment(request):
    if request.method == 'POST':
        # Process input data and build url vnpay
        form = PaymentForm(request.POST)
        if form.is_valid():
            order_type = form.cleaned_data['order_type']
            order_id = form.cleaned_data['order_id']
            amount = form.cleaned_data['amount']
            order_desc = form.cleaned_data['order_desc']
            bank_code = form.cleaned_data['bank_code']
            language = form.cleaned_data['language']
            ipaddr = get_client_ip(request)
            # Build URL Payment
            vnp = vnpay()
            vnp.requestData['vnp_Version'] = '2.1.0'
            vnp.requestData['vnp_Command'] = 'pay'
            vnp.requestData['vnp_TmnCode'] = settings.VNPAY_TMN_CODE
            vnp.requestData['vnp_Amount'] = amount * 100
            vnp.requestData['vnp_CurrCode'] = 'VND'
            vnp.requestData['vnp_TxnRef'] = order_id
            vnp.requestData['vnp_OrderInfo'] = order_desc
            vnp.requestData['vnp_OrderType'] = order_type
            # Check language, default: vn
            if language and language != '':
                vnp.requestData['vnp_Locale'] = language
            else:
                vnp.requestData['vnp_Locale'] = 'vn'
                # Check bank_code, if bank_code is empty, customer will be selected bank on VNPAY
            if bank_code and bank_code != "":
                vnp.requestData['vnp_BankCode'] = bank_code

            vnp.requestData['vnp_CreateDate'] = datetime.now().strftime('%Y%m%d%H%M%S')  # 20150410063022
            vnp.requestData['vnp_IpAddr'] = ipaddr
            vnp.requestData['vnp_ReturnUrl'] = settings.VNPAY_RETURN_URL
            vnpay_payment_url = vnp.get_payment_url(settings.VNPAY_PAYMENT_URL, settings.VNPAY_HASH_SECRET_KEY)
            print(vnpay_payment_url)
            return redirect(vnpay_payment_url)
        else:
            print("Form input not validate")
    else:
        return render(request, "vnpay/payment.html", {"title": "Thanh toán"})


def payment_ipn(request):
    inputData = request.GET
    if inputData:
        vnp = vnpay()
        vnp.responseData = inputData.dict()
        order_id = inputData['vnp_TxnRef']
        amount = inputData['vnp_Amount']
        order_desc = inputData['vnp_OrderInfo']
        vnp_TransactionNo = inputData['vnp_TransactionNo']
        vnp_ResponseCode = inputData['vnp_ResponseCode']
        vnp_TmnCode = inputData['vnp_TmnCode']
        vnp_PayDate = inputData['vnp_PayDate']
        vnp_BankCode = inputData['vnp_BankCode']
        vnp_CardType = inputData['vnp_CardType']
        if vnp.validate_response(settings.VNPAY_HASH_SECRET_KEY):
            # Check & Update Order Status in your Database
            # Your code here
            firstTimeUpdate = True
            totalamount = True
            if totalamount:
                if firstTimeUpdate:
                    if vnp_ResponseCode == '00':
                        print('Payment Success. Your code implement here')
                    else:
                        print('Payment Error. Your code implement here')

                    # Return VNPAY: Merchant update success
                    result = JsonResponse({'RspCode': '00', 'Message': 'Confirm Success'})
                else:
                    # Already Update
                    result = JsonResponse({'RspCode': '02', 'Message': 'Order Already Update'})
            else:
                # invalid amount
                result = JsonResponse({'RspCode': '04', 'Message': 'invalid amount'})
        else:
            # Invalid Signature
            result = JsonResponse({'RspCode': '97', 'Message': 'Invalid Signature'})
    else:
        result = JsonResponse({'RspCode': '99', 'Message': 'Invalid request'})

    return result


def payment_return(request):
    inputData = request.GET
    if inputData:
        vnp = vnpay()
        vnp.responseData = inputData.dict()
        order_id = inputData['vnp_TxnRef']
        amount = int(inputData['vnp_Amount']) / 100
        order_desc = inputData['vnp_OrderInfo']
        vnp_TransactionNo = inputData['vnp_TransactionNo']
        vnp_ResponseCode = inputData['vnp_ResponseCode']
        vnp_TmnCode = inputData['vnp_TmnCode']
        vnp_PayDate = inputData['vnp_PayDate']
        vnp_BankCode = inputData['vnp_BankCode']
        vnp_CardType = inputData['vnp_CardType']

        if vnp.validate_response(settings.VNPAY_HASH_SECRET_KEY):
            order = get_object_or_404(Order, id=int(order_desc))
            if vnp_ResponseCode == "00":
                payment = Bill.objects.create(
                    bill_code=order_id,
                    total_amount=amount,
                    bill_transactionNo=vnp_TransactionNo,
                    order_id=order_desc
                )
                order.status_pay = True
                order.save()
                return render(request, "vnpay/payment_return.html", {"title": "Kết quả thanh toán",
                                                                     "result": "Thành công", "order_id": order_id,
                                                                     "amount": amount,
                                                                     "order_desc": order_desc,
                                                                     "vnp_TransactionNo": vnp_TransactionNo,
                                                                     "vnp_ResponseCode": vnp_ResponseCode})
            else:
                return render(request, "vnpay/payment_return.html", {"title": "Kết quả thanh toán",
                                                                     "result": "Lỗi", "order_id": order_id,
                                                                     "amount": amount,
                                                                     "order_desc": order_desc,
                                                                     "vnp_TransactionNo": vnp_TransactionNo,
                                                                     "vnp_ResponseCode": vnp_ResponseCode})
        else:
            return render(request, "vnpay/payment_return.html",
                          {"title": "Kết quả thanh toán", "result": "Lỗi", "order_id": order_id, "amount": amount,
                           "order_desc": order_desc, "vnp_TransactionNo": vnp_TransactionNo,
                           "vnp_ResponseCode": vnp_ResponseCode, "msg": "Sai checksum"})
    else:
        return render(request, "vnpay/payment_return.html", {"title": "Kết quả thanh toán", "result": ""})


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


n = random.randint(10 ** 11, 10 ** 12 - 1)
n_str = str(n)
while len(n_str) < 12:
    n_str = '0' + n_str


def query(request):
    if request.method == 'GET':
        return render(request, "vnpay/query.html", {"title": "Kiểm tra kết quả giao dịch"})

    url = settings.VNPAY_API_URL
    secret_key = settings.VNPAY_HASH_SECRET_KEY
    vnp_TmnCode = settings.VNPAY_TMN_CODE
    vnp_Version = '2.1.0'

    vnp_RequestId = n_str
    vnp_Command = 'querydr'
    vnp_TxnRef = request.POST['order_id']
    vnp_OrderInfo = 'kiem tra gd'
    vnp_TransactionDate = request.POST['trans_date']
    vnp_CreateDate = datetime.now().strftime('%Y%m%d%H%M%S')
    vnp_IpAddr = get_client_ip(request)

    hash_data = "|".join([
        vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
        vnp_TxnRef, vnp_TransactionDate, vnp_CreateDate,
        vnp_IpAddr, vnp_OrderInfo
    ])

    secure_hash = hmac.new(secret_key.encode(), hash_data.encode(), hashlib.sha512).hexdigest()

    data = {
        "vnp_RequestId": vnp_RequestId,
        "vnp_TmnCode": vnp_TmnCode,
        "vnp_Command": vnp_Command,
        "vnp_TxnRef": vnp_TxnRef,
        "vnp_OrderInfo": vnp_OrderInfo,
        "vnp_TransactionDate": vnp_TransactionDate,
        "vnp_CreateDate": vnp_CreateDate,
        "vnp_IpAddr": vnp_IpAddr,
        "vnp_Version": vnp_Version,
        "vnp_SecureHash": secure_hash
    }

    headers = {"Content-Type": "application/json"}

    response = requests.post(url, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        response_json = json.loads(response.text)
    else:
        response_json = {"error": f"Request failed with status code: {response.status_code}"}

    return render(request, "vnpay/query.html",
                  {"title": "Kiểm tra kết quả giao dịch", "response_json": response_json})


def refund(request):
    if request.method == 'GET':
        return render(request, "vnpay/refund.html", {"title": "Hoàn tiền giao dịch"})

    url = settings.VNPAY_API_URL
    secret_key = settings.VNPAY_HASH_SECRET_KEY
    vnp_TmnCode = settings.VNPAY_TMN_CODE
    vnp_RequestId = n_str
    vnp_Version = '2.1.0'
    vnp_Command = 'refund'
    vnp_TransactionType = request.POST['TransactionType']
    vnp_TxnRef = request.POST['order_id']
    vnp_Amount = request.POST['amount']
    vnp_OrderInfo = request.POST['order_desc']
    vnp_TransactionNo = '0'
    vnp_TransactionDate = request.POST['trans_date']
    vnp_CreateDate = datetime.now().strftime('%Y%m%d%H%M%S')
    vnp_CreateBy = 'user01'
    vnp_IpAddr = get_client_ip(request)

    hash_data = "|".join([
        vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode, vnp_TransactionType, vnp_TxnRef,
        vnp_Amount, vnp_TransactionNo, vnp_TransactionDate, vnp_CreateBy, vnp_CreateDate,
        vnp_IpAddr, vnp_OrderInfo
    ])

    secure_hash = hmac.new(secret_key.encode(), hash_data.encode(), hashlib.sha512).hexdigest()

    data = {
        "vnp_RequestId": vnp_RequestId,
        "vnp_TmnCode": vnp_TmnCode,
        "vnp_Command": vnp_Command,
        "vnp_TxnRef": vnp_TxnRef,
        "vnp_Amount": vnp_Amount,
        "vnp_OrderInfo": vnp_OrderInfo,
        "vnp_TransactionDate": vnp_TransactionDate,
        "vnp_CreateDate": vnp_CreateDate,
        "vnp_IpAddr": vnp_IpAddr,
        "vnp_TransactionType": vnp_TransactionType,
        "vnp_TransactionNo": vnp_TransactionNo,
        "vnp_CreateBy": vnp_CreateBy,
        "vnp_Version": vnp_Version,
        "vnp_SecureHash": secure_hash
    }

    headers = {"Content-Type": "application/json"}

    response = requests.post(url, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        response_json = json.loads(response.text)
    else:
        response_json = {"error": f"Request failed with status code: {response.status_code}"}

    return render(request, "vnpay/refund.html",
                  {"title": "Kết quả hoàn tiền giao dịch", "response_json": response_json})


# paypal
@csrf_exempt
def send_paypal(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))

        order_id = data['id']
        capture_id = data['purchase_units'][0]['payments']['captures'][0]['id']
        amount = data['purchase_units'][0]['payments']['captures'][0]['amount']['value']
        giohang_id = data.get('giohang_id')
        # total_amount = data.get('total_amount')

        order = get_object_or_404(Order, id=int(giohang_id))
        bill = Bill.objects.create(
            bill_code=order_id,
            total_amount=amount,
            bill_transactionNo=capture_id,
            order_id=giohang_id
        )
        order.status_pay = True
        order.save()

        return JsonResponse({'status': 'success'})

    return render(request, 'paypal/sendpaypal.html')


def paypal_success(request, bill_code):
    bill = get_object_or_404(Bill, bill_code=bill_code)
    return render(request, 'paypal/paypal_success.html', {'bill': bill})
