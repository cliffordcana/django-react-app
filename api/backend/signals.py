from .models import CustomUser
from django.db.models.signals import post_save
from django.conf import settings

def customuser_receiver(sender, instance, created, *args, **kwargs):
    if created:
        customuser = CustomUser.objects.create(customuser=instance)
        
post_save.connect(customuser_receiver, sender=settings.AUTH_USER_MODEL)