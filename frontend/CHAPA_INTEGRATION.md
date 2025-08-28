# Chapa Payment Integration

This document explains how Chapa payment integration works in the frontend.

## Overview

Chapa is integrated as a payment method in the deposit flow. When users select Chapa, they need to provide additional information (firstName, lastName, email) before proceeding to payment.

## How It Works

### 1. User Flow
1. User goes to `/deposit` page
2. User enters amount and phone number
3. User selects "Chapa" as payment method
4. Additional fields appear: First Name, Last Name, Email
5. User fills all required fields
6. User clicks "Continue"
7. Frontend sends data to backend
8. Backend creates Chapa payment and returns checkout URL
9. Frontend redirects user to Chapa checkout page
10. User completes payment on Chapa
11. Chapa redirects back to success page
12. Payment status is checked and updated

### 2. Required Data for Chapa

```typescript
{
  amount: number,        // Required - payment amount
  phone: string,         // Required - user's phone number
  firstName: string,     // Required for Chapa
  lastName: string,      // Required for Chapa
  email: string          // Required for Chapa
}
```

### 3. Components

- **DepositPage**: Main deposit form with Chapa integration
- **ChapaPaymentStatus**: Component to check payment status
- **ChapaSuccess**: Success page after Chapa redirect

### 4. Routes

- `/deposit` - Main deposit page
- `/chapa-success` - Success page after Chapa payment

### 5. Payment Service

The `paymentService.ts` includes:
- `initiateDeposit()` - Sends payment data to backend
- `checkChapaPaymentStatus()` - Checks payment status

## Testing

1. Start your backend server
2. Start your frontend server
3. Go to `/deposit`
4. Select Chapa as payment method
5. Fill in all required fields
6. Click Continue
7. Check browser console for logs
8. You should be redirected to Chapa checkout

## Environment Variables

Make sure your backend has these environment variables:

```env
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_CALLBACK_URL=https://yourdomain.com/api/payments/webhook
CHAPA_RETURN_URL=https://yourdomain.com/chapa-success
CHAPA_ENCRYPTION_KEY=your_32_character_hex_key
```

## Troubleshooting

### Common Issues

1. **Fields not showing**: Make sure you've selected Chapa as payment method
2. **Form validation fails**: Ensure all Chapa fields are filled
3. **Payment not initiating**: Check browser console for errors
4. **Redirect not working**: Verify backend is running and accessible

### Debug Logs

The integration includes console logging:
- Payment payload being sent
- Selected payment method
- Payment response from backend
- Redirect URLs

Check browser console for these logs when testing.

## Security Notes

- Chapa secret key is only used in backend
- Frontend only sends user input data
- All sensitive operations happen server-side
- Payment verification is handled by backend webhooks
