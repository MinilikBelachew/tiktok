# Payment Integration with Chapa

This document explains how the frontend integrates with the backend payment system that uses Chapa for payment processing.

## Overview

The payment system integrates with your friend's backend that already has Chapa implemented. The frontend provides a user-friendly interface for deposits and withdrawals while the backend handles all the payment processing logic.

## Features

### ✅ What's Implemented

1. **Deposit System**
   - Phone number input with Ethiopian format validation
   - Amount input with proper formatting
   - Payment method selection (CBE, Telebirr, CBE Birr, Dashen Bank)
   - Integration with Chapa checkout
   - Real-time payment status checking

2. **Withdrawal System**
   - Account holder name input
   - Account/phone number input
   - Amount validation
   - Withdrawal request submission
   - Status tracking

3. **Transaction History**
   - Real-time payment history display
   - Withdrawal history display
   - Pagination support
   - Status indicators

4. **Payment Success Handling**
   - Return URL handling from Chapa
   - Payment status verification
   - Success/error state management

## How It Works

### 1. Deposit Flow

```
User Input → Frontend Validation → Backend API → Chapa Checkout → Payment Processing → Success Page
```

1. User enters amount and phone number
2. Frontend validates the input
3. Frontend calls backend `/api/payments/deposit` endpoint
4. Backend creates payment record and gets Chapa checkout URL
5. Frontend redirects user to Chapa checkout
6. User completes payment on Chapa
7. Chapa redirects back to success page
8. Frontend verifies payment status with backend

### 2. Withdrawal Flow

```
User Input → Frontend Validation → Backend API → Withdrawal Request → Processing → Status Update
```

1. User enters amount, account name, and account number
2. Frontend validates the input
3. Frontend calls backend `/api/payments/withdraw` endpoint
4. Backend creates withdrawal request
5. Admin processes withdrawal through backend
6. Status updates in real-time

## API Endpoints Used

The frontend integrates with these backend endpoints:

- `POST /api/payments/deposit` - Initiate deposit
- `POST /api/payments/withdraw` - Request withdrawal
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/withdrawals` - Get withdrawal history
- `GET /api/payments/status/:tx_ref` - Check payment status
- `GET /api/payments/success` - Payment success page

## Configuration

### Environment Variables

Update the `frontend/src/constants/index.ts` file with your backend URL:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com'  // ← Update this
    : 'http://localhost:3000',
  // ... rest of config
};
```

### Backend Requirements

Your backend should have:

1. **CORS enabled** for your frontend domain
2. **Authentication middleware** for protected endpoints
3. **Chapa API keys** configured in environment variables
4. **Database schema** matching the expected response formats

## Components

### Core Components

- `PaymentService` - Handles all API calls to backend
- `usePayment` - Custom hook for payment state management
- `PhoneNumberInput` - Ethiopian phone number input with validation
- `PaymentSuccess` - Handles payment return from Chapa

### Pages

- `DepositPage` - Deposit form and history
- `WithdrawPage` - Withdrawal form and history  
- `WalletPage` - Combined deposit/withdraw interface

## Usage Examples

### Making a Deposit

```typescript
import { usePayment } from '../hooks/usePayment';

const { initiateDeposit, loading, error } = usePayment();

const handleDeposit = async () => {
  try {
    await initiateDeposit({
      amount: 1000,
      phone: '251912345678'
    });
    // User will be redirected to Chapa checkout
  } catch (err) {
    console.error('Deposit failed:', err);
  }
};
```

### Requesting a Withdrawal

```typescript
import { usePayment } from '../hooks/usePayment';

const { requestWithdrawal, loading, error } = usePayment();

const handleWithdrawal = async () => {
  try {
    await requestWithdrawal({
      amount: 500,
      type: 'MOBILE_MONEY',
      accountName: 'John Doe',
      accountNumber: '251912345678'
    });
    // Withdrawal request submitted
  } catch (err) {
    console.error('Withdrawal failed:', err);
  }
};
```

## Error Handling

The system includes comprehensive error handling:

- **Form validation errors** - Displayed inline with form fields
- **API errors** - Shown in error alerts at the top of pages
- **Network errors** - Graceful fallbacks and retry mechanisms
- **Payment status errors** - Clear messaging for failed payments

## Security Features

- **Input validation** - All user inputs are validated before submission
- **Phone number formatting** - Ethiopian phone numbers are properly formatted
- **Amount validation** - Prevents invalid amounts and ensures proper decimal handling
- **Authentication** - Uses JWT tokens from localStorage/cookies for API calls

## Testing

### Local Development

1. Start your backend server on `http://localhost:3000`
2. Start frontend with `npm run dev`
3. Navigate to `/deposit` or `/withdraw` pages
4. Test with valid Ethiopian phone numbers (e.g., 0912345678)

### Test Data

- **Phone Numbers**: Use Ethiopian format (09XXXXXXXX or +251XXXXXXXX)
- **Amounts**: Use positive numbers with up to 2 decimal places
- **Account Names**: Use realistic names for withdrawal testing

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows your frontend domain
2. **Authentication Errors**: Check if JWT token is properly stored
3. **Phone Number Issues**: Verify phone number format (should be 9-12 digits)
4. **Payment Redirect Issues**: Check Chapa return URL configuration

### Debug Mode

Enable console logging by checking the browser console for:
- API request/response details
- Payment service errors
- Form validation errors

## Future Enhancements

Potential improvements that could be added:

1. **Real-time updates** - WebSocket integration for live payment status
2. **Payment notifications** - Email/SMS notifications for payment events
3. **Advanced validation** - Bank account number validation for withdrawals
4. **Payment scheduling** - Recurring deposit/withdrawal options
5. **Multi-currency support** - Support for other currencies beyond ETB

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify backend API endpoints are working
3. Ensure Chapa API keys are properly configured
4. Check network tab for failed API requests

The integration is designed to be robust and user-friendly while maintaining security and proper error handling.
