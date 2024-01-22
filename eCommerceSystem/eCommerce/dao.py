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


def product_revenue_statistics_in_month(store_id, product_id, year):
    data = []

    product_name = Product.objects.filter(id=product_id, store_id=store_id).values('name_product').first()

    if product_name:
        product_name = product_name['name_product']
        monthly_data = []

        for month in range(1, 13):
            start_date = datetime(year, month, 1)
            end_date = start_date.replace(month=start_date.month % 12 + 1, day=1) - timedelta(days=1)

            product_revenue = (
                    Product.objects.filter(id=product_id, store_id=store_id,
                                           orderdetail__order__created_at__date__range=[start_date, end_date])
                    .annotate(
                        total_revenue=ExpressionWrapper(
                            Sum(F('orderdetail__quantity') * F('price'), output_field=FloatField()),
                            output_field=FloatField()
                        ),
                        total_quantity=Sum('orderdetail__quantity')
                    )
                    .values('id', 'name_product', 'total_revenue', 'total_quantity')
                    .first() or {'total_revenue': 0, 'total_quantity': 0}
            )

            monthly_data.append({
                'id': product_id,
                'name_product': product_name,
                'total_revenue': product_revenue['total_revenue'],
                'total_quantity': product_revenue['total_quantity'],
                'month': month
            })

        data.extend(monthly_data)

    return data


def product_revenue_statistics_in_year(store_id, year, product_id):
    data = []
    product_name = Product.objects.filter(id=product_id, store_id=store_id).values('name_product').first()

    if product_name:
        product_name = product_name['name_product']
        yearly_data = []

        current_year = datetime.now().year
        start_year = year

        for year in range(start_year, current_year + 1):
            start_date = datetime(year, 1, 1)
            end_date = datetime(year, 12, 31)

            product_revenue = (
                    Product.objects.filter(id=product_id, store_id=store_id,
                                           orderdetail__order__created_at__date__range=[start_date, end_date])
                    .annotate(
                        total_revenue=ExpressionWrapper(
                            Sum(F('orderdetail__quantity') * F('price'), output_field=FloatField()),
                            output_field=FloatField()
                        ),
                        total_quantity=Sum('orderdetail__quantity')
                    )
                    .values('id', 'name_product', 'total_revenue', 'total_quantity')
                    .first() or {'total_revenue': 0, 'total_quantity': 0}
            )

            yearly_data.append({
                'id': product_id,
                'name_product': product_name,
                'total_revenue': product_revenue['total_revenue'],
                'total_quantity': product_revenue['total_quantity'],
            })
        data.extend(yearly_data)
    return data


def product_revenue_statistics_in_quarter(store_id, year, product_id):
    data = []
    product_name = Product.objects.filter(id=product_id, store_id=store_id).values('name_product').first()

    if product_name:
        product_name = product_name['name_product']
        quarterly_data = []

        for quarter in range(1, 5):
            start_date = datetime(year, (quarter - 1) * 3 + 1, 1)
            # Tính toán ngày cuối cùng của quý
            end_date = start_date.replace(month=start_date.month + 2) + timedelta(days=30)

            product_revenue = (
                Product.objects.filter(id=product_id, store_id=store_id,
                                       orderdetail__order__created_at__date__range=[start_date, end_date])
                .annotate(
                    total_revenue=ExpressionWrapper(
                        Sum(F('orderdetail__quantity') * F('price'), output_field=FloatField()),
                        output_field=FloatField()
                    ),
                    total_quantity=Sum('orderdetail__quantity')
                )
                .values('id', 'name_product', 'total_revenue', 'total_quantity')
                .first()
            )
            if product_revenue is None:
                product_revenue = {'total_revenue': 0, 'total_quantity': 0}

            quarterly_data.append({
                'id': product_id,
                'name_product': product_name,
                'total_revenue': product_revenue['total_revenue'],
                'total_quantity': product_revenue['total_quantity'],
            })
        data.extend(quarterly_data)
    return data


def category_revenue_statistics_in_month(store_id, year, category_id):
    data = []
    category = Product.objects.filter(category=category_id, store_id=store_id).values(
        'category__name_category').first()

    if category:
        name_category = category['category__name_category']
        monthly_data = []

        for month in range(1, 13):
            start_date = datetime(year, month, 1)
            end_date = start_date.replace(month=start_date.month % 12 + 1, day=1) - timedelta(days=1)

            category_revenue = (
                Product.objects.filter(category=category_id, store_id=store_id,
                                       orderdetail__order__created_at__date__range=[start_date, end_date])
                .annotate(
                    total_revenue=ExpressionWrapper(
                        Sum(F('orderdetail__quantity') * F('price'), output_field=FloatField()),
                        output_field=FloatField()
                    ),
                    total_quantity=Sum('orderdetail__quantity')
                )
                .values('category__id', 'total_revenue', 'total_quantity')
                .order_by('category__id')
            )

            monthly_data.append({
                'id': category_id,
                'name_category': name_category,
                'total_revenue': sum(item['total_revenue'] for item in category_revenue) or 0,
                'total_quantity': sum(item['total_quantity'] for item in category_revenue) or 0,
                'month': month
            })

        data.extend(monthly_data)

    return data


def category_revenue_statistics_in_year(store_id, year, category_id):
    data = []
    category = Product.objects.filter(category=category_id, store_id=store_id).values(
        'category__name_category').first()

    if category:
        name_category = category['category__name_category']
        yearly_data = []

        current_year = datetime.now().year
        start_year = year

        for year in range(start_year, current_year + 1):
            start_date = datetime(year, 1, 1)
            end_date = datetime(year, 12, 31)

            category_revenue = (
                Product.objects.filter(category=category_id, store_id=store_id,
                                       orderdetail__order__created_at__date__range=[start_date, end_date])
                .annotate(
                    total_revenue=ExpressionWrapper(
                        Sum(F('orderdetail__quantity') * F('price'), output_field=FloatField()),
                        output_field=FloatField()
                    ),
                    total_quantity=Sum('orderdetail__quantity')
                )
                .values('category__id', 'total_revenue', 'total_quantity')
                .order_by('category__id')
            )

            yearly_data.append({
                'id': category_id,
                'name_category': name_category,
                'total_revenue': sum(item['total_revenue'] for item in category_revenue) or 0,
                'total_quantity': sum(item['total_quantity'] for item in category_revenue) or 0,
                'year': year
            })

        data.extend(yearly_data)

    return data


def category_revenue_statistics_in_quarter(store_id, year, category_id):
    data = []
    category = Product.objects.filter(category=category_id, store_id=store_id).values(
        'category__name_category').first()

    if category:
        name_category = category['category__name_category']
        quarterly_data = []

        for quarter in range(1, 5):
            start_date = datetime(year, (quarter - 1) * 3 + 1, 1)
            # Tính toán ngày cuối cùng của quý
            end_date = start_date.replace(month=start_date.month + 2) + timedelta(days=30)

            category_revenue = (
                Product.objects.filter(category=category_id, store_id=store_id,
                                       orderdetail__order__created_at__date__range=[start_date, end_date])
                .annotate(
                    total_revenue=ExpressionWrapper(
                        Sum(F('orderdetail__quantity') * F('price'), output_field=FloatField()),
                        output_field=FloatField()
                    ),
                    total_quantity=Sum('orderdetail__quantity')
                )
                .values('category__id', 'total_revenue', 'total_quantity')
                .order_by('category__id')
            )

            quarterly_data.append({
                'id': category_id,
                'name_category': name_category,
                'total_revenue': sum(item['total_revenue'] for item in category_revenue) or 0,
                'total_quantity': sum(item['total_quantity'] for item in category_revenue) or 0,
            })

        data.extend(quarterly_data)

    return data
