from django.urls import path
from .views import SendOTP, VerifyOTP

urlpatterns = [
    path('send-otp/', SendOTP.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTP.as_view(), name='verify_otp'),
] 