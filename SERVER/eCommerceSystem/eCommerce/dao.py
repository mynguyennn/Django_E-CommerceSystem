# from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta

from django.db.models import Count, Sum, F, FloatField, ExpressionWrapper
from django.db.models.functions import ExtractMonth, ExtractYear

from .models import Account, UserRole, Product, OrderDetail, Order
from .serializers import ProductSerializer, OrderDetailSerializer


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
        filters['order__created_at__month'] = month
        filters['order__status_pay'] = 1
        # district giúp chỉ đếm order mà k đếm từng orderdetail
        order_count_by_store = OrderDetail.objects.values('product__store__name_store').annotate(
            order_counts=Count('order', distinct=True))
    return order_count_by_store


def get_order_count_in_year(year):
    filters = {}
    order_counts = None
    if year:
        filters['order__created_at__year'] = year
        filters['order__status_pay'] = 1
        order_count_by_store = OrderDetail.objects.values('product__store__name_store').annotate(
            order_counts=Count('order', distinct=True))
        return order_count_by_store


def get_order_count_in_quarter(quarter):
    filters = {}
    order_counts = None
    if quarter:
        current_year = datetime.now().year
        filters['order__created_at__year'] = current_year
        filters['order__status_pay'] = 1
        filters['order__created_at__quarter'] = quarter
        order_count_by_store = OrderDetail.objects.values('product__store__name_store').annotate(
            order_counts=Count('order', distinct=True))
        return order_count_by_store


##=================================================##saller - stast product and category


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
                                           orderdetail__order__created_at__date__range=[start_date, end_date],
                                           orderdetail__order__status_pay=True)
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
                                           orderdetail__order__created_at__date__range=[start_date, end_date],
                                           orderdetail__order__status_pay=True)
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
                                       orderdetail__order__created_at__date__range=[start_date, end_date],
                                       orderdetail__order__status_pay=True)
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
                                       orderdetail__order__created_at__date__range=[start_date, end_date],
                                       orderdetail__order__status_pay=True)
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
                                       orderdetail__order__created_at__date__range=[start_date, end_date],
                                       orderdetail__order__status_pay=True)
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
                                       orderdetail__order__created_at__date__range=[start_date, end_date],
                                       orderdetail__order__status_pay=True)
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


##=================================================##manager - stats count product


def product_count_statistics_in_month(store, year):
    monthly_stats = (
        Product.objects
        .annotate(month=ExtractMonth('created_at'))
        .filter(created_at__year=year, store=store, status=True)
        .values('month')
        .annotate(
            total_products=Count('id'),
        )
    )

    all_months_stats = [
        {
            'month': month,
            'total_products': 0,
            'product_info': []
        } for month in range(1, 13)
    ]

    total_products_all_months = 0

    for stats in monthly_stats:
        month = stats['month']
        products = Product.objects.filter(created_at__year=year, created_at__month=month, store=store)
        product_info = ProductSerializer(products, many=True).data

        total_products_all_months += stats['total_products']

        all_months_stats[month - 1].update({
            'total_products': stats['total_products'],
            'product_info': product_info,
        })

    return {
        'total_products_all_months': total_products_all_months,
        'monthly_stats': all_months_stats,
    }


def product_count_statistics_in_quarter(store, year):
    quarterly_stats = []
    total_products_all_quarters = 0

    for quarter in range(1, 5):
        start_date = datetime(year, (quarter - 1) * 3 + 1, 1)
        end_date = start_date.replace(month=start_date.month + 2) + timedelta(days=30)

        products = Product.objects.filter(
            created_at__year=year,
            created_at__month__in=[(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, (quarter - 1) * 3 + 3],
            store=store,
            status=True
        )

        product_info = ProductSerializer(products, many=True).data

        total_products = products.count()

        total_products_all_quarters += total_products

        quarterly_stats.append({
            'quarter': quarter,
            'total_products': total_products,
            'product_info': product_info,
        })

    return {
        'total_products_all_quarters': total_products_all_quarters,
        'quarterly_stats': quarterly_stats,
    }


##=================================================##manager - count order


def order_count_statistics_in_month(store_id, year):
    monthly_stats = (
        OrderDetail.objects
        .filter(product__store_id=store_id, order__created_at__year=year)
        .annotate(month=ExtractMonth('order__created_at'))
        .values('month')
        .annotate(
            total_orders=Count('order__id'),
        )
    )

    all_months_stats = [
        {
            'month': month,
            'total_orders': 0,
            'order_info': []
        } for month in range(1, 13)
    ]


    for stats in monthly_stats:
        month = stats['month']
        orders = OrderDetail.objects.filter(
            product__store_id=store_id,
            order__created_at__year=year,
            order__created_at__month=month
        )

        order_info = OrderDetailSerializer(orders, many=True).data


        all_months_stats[month - 1].update({
            'total_orders': stats['total_orders'],
            'order_info': order_info,
        })

    return {
        'monthly_stats': all_months_stats,
    }

def order_count_statistics_in_quarter(store_id, year):
    try:
        year = int(year)
    except ValueError:
        return {'quarterly_stats': []}

    quarterly_stats = []

    for quarter in range(1, 5):
        start_date = datetime(year, (quarter - 1) * 3 + 1, 1)
        end_date = start_date.replace(month=start_date.month + 2) + timedelta(days=30)

        orders = OrderDetail.objects.filter(
            product__store_id=store_id,
            order__created_at__range=[start_date, end_date]
        )

        order_info = OrderDetailSerializer(orders, many=True).data

        total_orders = orders.count()

        quarterly_stats.append({
            'quarter': quarter,
            'total_orders': total_orders,
            'order_info': order_info,
        })

    return {
        'quarterly_stats': quarterly_stats,
    }