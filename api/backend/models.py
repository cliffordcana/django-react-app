from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager

CATEGORY_CHOICES = (
    ('K', 'Kobe'),
    ('J', 'Jordan'),
)

LABEL_CHOICES = (
    ('R', 'Rare'),
    ('L', 'Limited'),
)

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Item(models.Model):
    title = models.CharField(max_length=100)
    price = models.FloatField()
    discount_price = models.FloatField(blank=True, null=True)
    category = models.CharField(choices=CATEGORY_CHOICES, max_length=2)
    label = models.CharField(choices=LABEL_CHOICES, max_length=1)
    slug = models.SlugField()
    description = models.TextField()
    image = models.ImageField(upload_to='images')

    def __str__(self):
        return self.title

class OrderItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ordered = models.BooleanField(default=False)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f'{self.quantity} of {self.item.title}'

    def get_total_item_price(self):
        return self.quantity * self.item.price 
    def get_total_discount_item_price(self): 
        return self.quantity * self.item.discount_price 

    def get_amount_saved(self):
        return self.get_total_item_price() - self.get_total_discount_item_price() 
    
    def get_final_price(self):
        if self.item.discount_price:
            return self.get_total_discount_item_price()
        return self.get_total_item_price()

class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    items = models.ManyToManyField(OrderItem)
    start_date = models.DateTimeField(auto_now_add=True)
    ordered_date = models.DateTimeField()
    ordered = models.BooleanField(default=False)
    coupon = models.ForeignKey('Coupon', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.user.username

    def get_total(self):
        total = 0
        for order_item in self.items.all():
            total += order_item.get_final_price()   #final computation for added to cart items
        if self.coupon:
            total -= self.coupon.amount
        return total

class Coupon(models.Model):
    code = models.CharField(max_length=20)
    amount = models.FloatField()

    def __str__(self):
        return self.code
