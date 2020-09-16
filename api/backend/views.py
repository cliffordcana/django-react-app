from rest_framework import viewsets
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .serializers import ItemSerializer, ItemDetailSerializer, OrderSerializer 
from .models import Item, Order, OrderItem, Coupon, CustomUser 
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.conf import settings
from rest_framework_extensions.mixins import DetailSerializerMixin, NestedViewSetMixin

import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

class ItemViewSet(DetailSerializerMixin, NestedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = ItemSerializer
    serializer_detail_class = ItemDetailSerializer
    permission_classes = (permissions.AllowAny, )
    queryset = Item.objects.all()
    
class AddToCartView(APIView):
    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        if slug is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        item = get_object_or_404(Item, slug=slug)

        order_item_qs = OrderItem.objects.filter(
            item=item,
            user=self.request.user,
            ordered=False
        )

        if order_item_qs.exists():
            order_item = order_item_qs.first()
            order_item.quantity += 1
            order_item.save()

        else:
            order_item = OrderItem.objects.create(
                item=item,
                user=self.request.user,
                ordered=False
            )
            order_item.save()

        order_qs = Order.objects.filter(user=self.request.user, ordered=False)

        if order_qs.exists():
            order = order_qs[0]
            if not order.items.filter(item__id=order_item.id).exists():
                order.items.add(order_item)
            return Response(status=status.HTTP_200_OK)

        else:
            ordered_date = timezone.now()
            order = Order.objects.create(
                user=self.request.user, ordered_date=ordered_date)
            order.items.add(order_item)

            return Response(status=status.HTTP_200_OK)

class RemoveFromCartView(APIView):
    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        if slug is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        item = get_object_or_404(Item, slug=slug)
        order_qs = Order.objects.filter(user=self.request.user, ordered=False) #only fetch the order that has not been completed

        if order_qs.exists():
            order = order_qs[0]
            # check if the order item is in the order
            if order.items.filter(item__slug=item.slug).exists():
                order_item = OrderItem.objects.filter(
                    item=item,
                    user=self.request.user,
                    ordered=False
                )[0]
                if order_item.quantity > 1:
                    order_item.quantity -= 1
                    order_item.save()
                else:
                    order.items.remove(order_item)
                return Response(status=status.HTTP_200_OK)
            
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(generics.RetrieveAPIView): #order summary
    serializer_class = OrderSerializer

    def get_object(self):
        try:
            order = Order.objects.get(user=self.request.user, ordered=False)
            return order
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class OrderItemDeleteView(generics.DestroyAPIView):
    queryset = OrderItem.objects.all()
    permission_classes = (permissions.IsAuthenticated, )


class AddCouponView(APIView):

    def post(self, request, *args, **kwargs):
        code = request.data.get('code', None)
        if code is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        order = Order.objects.get(user=self.request.user, ordered=False)
        coupon = get_object_or_404(Coupon, code=code)
        order.coupon = coupon
        order.save()
        return Response(status=status.HTTP_200_OK)








