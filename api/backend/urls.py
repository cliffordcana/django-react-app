from django.urls import path, include
from .views import (
    ItemViewSet,
    AddToCartView,
    RemoveFromCartView,
    OrderDetailView,
    OrderItemDeleteView,
    AddCouponView,
)
from rest_framework_extensions.routers import ExtendedSimpleRouter as DefaultRouter
router = DefaultRouter()

router.register(r'items', ItemViewSet)

app_name = 'backend'

urlpatterns = [
    path('add-to-cart/', AddToCartView.as_view(), name='add-to-cart'),
    path('remove-from-cart/', RemoveFromCartView.as_view(), name='remove-from-cart'),
    path('order-summary/', OrderDetailView.as_view(), name='order-summary'),
    path('order-items/<pk>/delete/', OrderItemDeleteView.as_view(), name='order-item-delete'),
    path('add-coupon/', AddCouponView.as_view(), name='add-coupon'),
    path('', include(router.urls)),
]

