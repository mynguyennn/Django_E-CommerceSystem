from dateutil.relativedelta import relativedelta
from .models import Account, UserRole, Product, Store, OrderDetail, Order
from django.db.models import Count, Sum, F, FloatField, Case, When, Value, ExpressionWrapper
from django.db.models.functions import Cast, Coalesce, ExtractMonth
from datetime import datetime, timedelta
from django.utils import timezone


def load_account(params={}):
    q = Account.objects.all()

    kw = params.get('kw')
    if kw:
        q = q.filter(subject__icontains=kw)

    role_id = params.get('role_id')
    if role_id:
        q = q.filter(role_id=role_id)
    return q


def count_account_by_role():
    return UserRole.objects.annotate(count=Count('roles__id')).values(
        "id", "name_role", "count"
    ).order_by('count')


def get_order_count_in_month(month):
    filters = {}
    order_counts = None
    if month:
        current_year = datetime.now().year
        filters['order__created_at__year'] = current_year
        filters['order__created_at__year'] = current_year
        filters['order__created_at__quarter'] = month
        order_counts = OrderDetail.objects.filter(**filters).values('product__store__name_store').annotate(
            order_counts=Count('order')
        ).annotate(
            name_store=F('product__store__name_store')
        ).values('name_store', 'order_counts')
    return order_counts


def get_order_count_in_year(year):
    filters = {}
    order_counts = None
    if year:
        filters['order__created_at__year'] = year
        order_counts = OrderDetail.objects.filter(**filters).values('product__store__name_store').annotate(
            order_counts=Count('order')
        ).annotate(
            name_store=F('product__store__name_store')
        ).values('name_store', 'order_counts')
    return order_counts


def get_order_count_in_quarter(quarter):
    filters = {}
    order_counts = None
    if quarter:
        current_year = datetime.now().year
        filters['order__created_at__year'] = current_year
        filters['order__created_at__year'] = current_year
        filters['order__created_at__quarter'] = quarter
        order_counts = OrderDetail.objects.filter(**filters).values('product__store__name_store').annotate(
            order_counts=Count('order')
        ).annotate(
            name_store=F('product__store__name_store')
        ).values('name_store', 'order_counts')

    return order_counts


def get_count_quantity_product_in_order_by_month(month):
    filters = {}
    counts_quantity = None
    if month:
        filters['order__created_at__month'] = month
        current_year = datetime.now().year
        filters['order__created_at__year'] = current_year
        counts_quantity = OrderDetail.objects.filter(**filters).values('product__store__name_store').annotate(
            counts_quantity=Sum('quantity')
        ).annotate(
            name_store=F('product__store__name_store')
        ).values('name_store', 'counts_quantity')
    return counts_quantity


def get_count_quantity_product_in_order_by_year(year):
    filters = {}
    counts_quantity = None
    if year:
        filters['order__created_at__year'] = year
        counts_quantity = OrderDetail.objects.filter(**filters).values('product__store__name_store').annotate(
            counts_quantity=Sum('quantity')
        ).annotate(
            name_store=F('product__store__name_store')
        ).values('name_store', 'counts_quantity')
    return counts_quantity


def get_count_quantity_product_in_order_by_quarter(quarter):
    filters = {}
    counts_quantity = None
    if quarter:
        current_year = datetime.now().year
        filters['order__created_at__year'] = current_year
        filters['order__created_at__year'] = current_year
        filters['order__created_at__quarter'] = quarter
        counts_quantity = OrderDetail.objects.filter(**filters).values('product__store__name_store').annotate(
            counts_quantity=Sum('quantity')
        ).annotate(
            name_store=F('product__store__name_store')
        ).values('name_store', 'counts_quantity')
    return counts_quantity


def product_revenue_statistics_in_month(store_id, month):
    filters = {}
    if month:
        current_year = datetime.now().year
        start_date = datetime(current_year, int(month), 1)
        end_date = start_date.replace(month=start_date.month % 12 + 1, day=1) - timedelta(days=1)
        filters['orderdetail__order__created_at__date__range'] = [start_date, end_date]
        product_revenues = Product.objects.filter(store_id=store_id, **filters).annotate(
            total_revenue=ExpressionWrapper(
                Sum(F('orderdetail__quantity') * F('price'), output_field=FloatField()),
                output_field=FloatField()
            )
        ).order_by('name_product').values('name_product', 'total_revenue')
        return list(product_revenues)


def product_revenue_statistics_in_year(store_id, year):
    filters = {}
    if year:
        filters['orderdetail__order__created_at__year'] = year
        product_revenues = Product.objects.filter(store_id=store_id, **filters).annotate(
            total_revenue=ExpressionWrapper(
                Sum(F('orderdetail__quantity') * F('price'), output_field=FloatField()),
                output_field=FloatField()
            )
        ).order_by('name_product').values('name_product', 'total_revenue')
        return list(product_revenues)


def product_revenue_statistics_in_quarter(store_id, quarter):
    filters = {}
    if quarter:
        filters['orderdetail__order__created_at__quarter'] = quarter
        product_revenues = Product.objects.filter(store_id=store_id, **filters).annotate(
            total_revenue=ExpressionWrapper(
                Sum(F('orderdetail__quantity') * F('price'), output_field=FloatField()),
                output_field=FloatField()
            )
        ).order_by('name_product').values('name_product', 'total_revenue')
        return list(product_revenues)


def category_revenue_statistics_in_month(store_id, month):
    filters = {}
    if month:
        current_year = datetime.now().year
        start_date = datetime(current_year, int(month), 1)
        end_date = start_date.replace(month=start_date.month % 12 + 1, day=1) - timedelta(days=1)
        filters['orderdetail__order__created_at__date__range'] = [start_date, end_date]
        category_revenues = Product.objects.filter(store_id=store_id, **filters).values(
            'category__name_category').annotate(
            total_revenue=Sum(Cast('orderdetail__quantity', FloatField()) * F('price'), output_field=FloatField())
        ).order_by('category__name_category').values('category__name_category', 'total_revenue')
        return category_revenues


def category_revenue_statistics_in_year(store_id, year):
    filters = {}
    if year:
        filters['orderdetail__order__created_at__year'] = year
        category_revenues = Product.objects.filter(store_id=store_id, **filters).values(
            'category__name_category').annotate(
            total_revenue=Sum(Cast('orderdetail__quantity', FloatField()) * F('price'), output_field=FloatField())
        ).order_by('category__name_category').values('category__name_category', 'total_revenue')
        return category_revenues


def category_revenue_statistics_in_quarter(store_id, quarter):
    filters = {}
    if quarter:
        filters['orderdetail__order__created_at__quarter'] = quarter
        category_revenues = Product.objects.filter(store_id=store_id, **filters).values(
            'category__name_category').annotate(
            total_revenue=Sum(Cast('orderdetail__quantity', FloatField()) * F('price'), output_field=FloatField())
        ).order_by('category__name_category').values('category__name_category', 'total_revenue')
        return category_revenues


# def product_revenue_12month_of_year(store_id, year):
#     year = int(year)  # Chuyển 'year' sang kiểu số nguyên nếu nó được truyền dưới dạng chuỗi
#
#     # Tạo một danh sách chứa 12 tháng của năm
#     months = [datetime(year, month, 1) for month in range(1, 13)]
#
#     # Tạo một danh sách chứa các truy vấn cho từng tháng
#     queries = []
#     for month in months:
#         next_month = month + timedelta(days=32)
#         query = ExpressionWrapper(
#             Coalesce(
#                 Sum(
#                     Case(
#                         When(
#                             orderdetail__order__created_at__gte=month,
#                             orderdetail__order__created_at__lt=next_month,
#                             then=ExpressionWrapper(F('orderdetail__quantity') * F('price'), output_field=FloatField())
#                         ),
#                         default=Value(0),
#                         output_field=FloatField()
#                     )
#                 ),
#                 Value(0)
#             ),
#             output_field=FloatField()
#         )
#         queries.append(query)
#
#         # Thực hiện các truy vấn và kết hợp kết quả
#     product_revenues = Product.objects.filter(store_id=store_id, orderdetail__order__created_at__year=year).annotate(
#         **{f'total_revenue_{month.strftime("%b")}': query for month, query in zip(months, queries)}
#     ).order_by('name_product').values('name_product', *[f'total_revenue_{month.strftime("%b")}' for month in months])
#
#     return product_revenues
