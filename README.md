# OTP Authentication with SMS and WhatsApp

This project demonstrates SMS and WhatsApp OTP authentication using Django, React, and Twilio.

## Twilio WhatsApp Sandbox Setup

To receive WhatsApp OTPs, you need to join Twilio's WhatsApp Sandbox:

1. **Create a Twilio Account**:
   - Sign up at [twilio.com](https://www.twilio.com/try-twilio)
   - Verify your email and phone number

2. **Configure WhatsApp Sandbox**:
   - Go to the [WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn) in your Twilio Console
   - You'll see a WhatsApp sandbox number and a join code (like "join <word1>-<word2>")
   - From your mobile phone, send a WhatsApp message to the sandbox number with the provided join code
   - You should receive a confirmation message

3. **Update Environment Variables**:
   - Create a `.env` file in the backend directory (or update the existing one)
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
   ```

## WhatsApp Sandbox Limitations

- In sandbox mode, you can only message numbers that have opted in
- Messages must follow pre-approved templates
- The sandbox is for testing only; for production, you need to register for the WhatsApp Business API

## Common Issues

1. **Not receiving WhatsApp messages**:
   - Ensure you've joined the sandbox by sending the join code
   - Check that your phone number is in the correct international format
   - Verify Twilio account has credits available

2. **Error messages**:
   - Check the Django console logs for detailed error information
   - Ensure your message format follows the approved templates

## SMS vs WhatsApp OTP

This application supports both SMS and WhatsApp for OTP delivery:

- SMS works without additional setup but requires Twilio credits
- WhatsApp requires joining the sandbox but can be more cost-effective

## Running the Application

1. Start the backend:
   ```
   cd backend
   python manage.py runserver 8000
   ```

2. Start the frontend:
   ```
   cd frontend
   npm start
   ```

3. Access the application at http://localhost:3000 