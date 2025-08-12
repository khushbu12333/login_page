from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random
import os
from twilio.rest import Client
from django.conf import settings

# Create your views here.

# Dictionary to store OTPs for mobile numbers
otp_store = {}

# Twilio configuration
# In production, store these credentials in environment variables
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '') # Your Twilio phone number
TWILIO_WHATSAPP_NUMBER = os.environ.get('TWILIO_WHATSAPP_NUMBER', '') # Your Twilio WhatsApp number

class SendOTP(APIView):
    def post(self, request):
        # Extract mobile number and method from request
        mobile_number = request.data.get('mobile_number')
        method = request.data.get('method', 'sms')  # Default to SMS if not specified
        
        if not mobile_number:
            return Response({'error': 'Mobile number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate a random 6-digit OTP
        otp = random.randint(100000, 999999)
        
        # Store the OTP for this mobile number
        otp_store[mobile_number] = str(otp)
        
        # Format phone number for international use
        if not mobile_number.startswith('+'):
            formatted_number = '+91' + mobile_number  # Assuming India country code
        else:
            formatted_number = mobile_number
        
        try:
            # Initialize Twilio client with credentials from settings
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            
            if method.lower() == 'whatsapp':
                # Send OTP via WhatsApp using pre-approved format for sandbox
                try:
                    # For WhatsApp Sandbox, messages must follow a pre-approved template format
                    message = client.messages.create(
                        from_=f'whatsapp:{+14155238886}',
                        body=f'Your verification code is: {otp}',
                        to=f'whatsapp:{formatted_number}'
                    )
                    print(f"WhatsApp Message SID: {message.sid}")
                    return Response({
                        'message': 'OTP sent to WhatsApp',
                        'status': 'success'
                    }, status=status.HTTP_200_OK)
                except Exception as e:
                    print(f"WhatsApp error: {str(e)}")
                    # For development only
                    return Response({
                        'message': f'Failed to send WhatsApp: {str(e)}',
                        'otp': otp,
                        'status': 'error'
                    }, status=status.HTTP_200_OK)
            else:
                # Send OTP via SMS
                message = client.messages.create(
                    from_=settings.TWILIO_PHONE_NUMBER,
                    body=f'Your Exellar verification code is: {otp}',
                    to=formatted_number
                )
                return Response({'message': 'OTP sent via SMS'}, status=status.HTTP_200_OK)
                
        except Exception as e:
            # For development only - return OTP in response for testing
            # In production, remove this and only return error message
            return Response({
                'message': f'Failed to send OTP: {str(e)}', 
                'otp': otp
            }, status=status.HTTP_200_OK)

class VerifyOTP(APIView):
    def post(self, request):
        # Extract OTP and mobile number from request
        mobile_number = request.data.get('mobile_number')
        otp = request.data.get('otp')
        
        if not mobile_number or not otp:
            return Response({'error': 'Mobile number and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the OTP for this mobile number
        stored_otp = otp_store.get(mobile_number)
        
        if stored_otp and stored_otp == otp:
            # Clear the OTP after successful verification
            del otp_store[mobile_number]
            return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
