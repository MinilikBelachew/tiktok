# Session Management System

This document explains how the session management system works in the frontend application.

## Overview

The session management system provides persistent authentication across browser sessions using localStorage and automatic session validation with the backend.

## Components

### 1. SecureSessionManager (`src/utils/secureSessionManager.ts`)
Core utility class that handles:
- Saving minimal session data to localStorage (only authentication status)
- Loading minimal session data from localStorage
- Clearing session data
- Session expiration checking
- Session extension

### 2. SessionInitializer (`src/components/session/SessionInitializer.tsx`)
Component that runs on app startup to:
- Restore session from localStorage
- Validate session with backend
- Clear invalid sessions

### 3. SessionActivityTracker (`src/components/session/SessionActivityTracker.tsx`)
Component that tracks user activity and extends session duration based on activity.

### 4. SessionStatus (`src/components/session/SessionStatus.tsx`)
UI component that displays session information and provides logout functionality.

### 5. useSession Hook (`src/hooks/useSession.ts`)
Custom hook that provides easy access to session functionality throughout the app.

## Features

### Session Persistence
- Sessions are automatically saved to localStorage when users log in
- Sessions persist across browser refreshes and tab closures
- Session data includes ONLY authentication status (NO user data, NO tokens)
- User data is fetched from backend on each session restore
- Authentication tokens are handled securely via HTTP-only cookies

### Session Validation
- Sessions are validated against the backend on app startup
- Invalid sessions are automatically cleared
- Backend validation ensures security

### Session Expiration
- Sessions expire after 24 hours by default
- Expired sessions are automatically cleared
- Users are redirected to login when sessions expire

### Activity-Based Extension
- Sessions are extended based on user activity
- Activity tracking includes mouse, keyboard, and touch events
- Sessions extend every 5 minutes of activity

### Automatic Cleanup
- Sessions are cleared on logout
- Invalid sessions are automatically removed
- Failed backend validation triggers session cleanup

## Usage

### Basic Usage
The session management system is automatically integrated into the app. No additional setup is required.

### Using the useSession Hook
```typescript
import { useSession } from '../hooks/useSession';

const MyComponent = () => {
  const { isAuthenticated, user, logout, getSessionInfo } = useSession();

  const handleLogout = () => {
    logout();
  };

  const checkSession = () => {
    const sessionInfo = getSessionInfo();
    console.log('Session info:', sessionInfo);
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
};
```

### Using SessionStatus Component
```typescript
import SessionStatus from '../components/session/SessionStatus';

const Header = () => {
  return (
    <header>
      <h1>My App</h1>
      <SessionStatus showDetails={true} />
    </header>
  );
};
```

### Manual Session Management
```typescript
import SessionManager from '../utils/sessionManager';

// Save session manually
SessionManager.saveSession({
  isAuthenticated: true,
  user: userData,
  token: 'user-token'
});

// Check if session is valid
const isValid = SessionManager.isSessionValid();

// Clear session manually
SessionManager.clearSession();

// Extend session
SessionManager.extendSession();
```

## Configuration

### Session Duration
The default session duration is 24 hours. To change this, modify the `SESSION_DURATION` constant in `SessionManager`:

```typescript
private static readonly SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours
```

### Activity Extension Interval
The session extension interval is 5 minutes. To change this, modify the timeout in `SessionActivityTracker`:

```typescript
activityTimeout = setTimeout(() => {
  SessionManager.extendSession();
}, 10 * 60 * 1000); // 10 minutes
```

## Security Considerations

1. **HTTP-only Cookies**: The system uses secure HTTP-only cookies for backend authentication (tokens are NOT stored in localStorage)
2. **Minimal LocalStorage**: Only authentication status is stored in localStorage (NO user data, NO tokens)
3. **Backend Validation**: Sessions are validated against the backend on startup using cookies
4. **User Data Fetching**: User data is fetched from backend on each session restore
5. **Automatic Cleanup**: Invalid sessions are automatically cleared
6. **Expiration**: Sessions have a maximum lifetime to prevent indefinite access
7. **XSS Protection**: Tokens and user data are not accessible via JavaScript, protecting against XSS attacks

## Troubleshooting

### Session Not Persisting
- Check if localStorage is available and not disabled
- Verify that the session is being saved correctly
- Check browser console for any errors

### Session Validation Failing
- Ensure the backend is running and accessible
- Check network connectivity
- Verify that cookies are being sent with requests

### Session Expiring Too Quickly
- Check the session duration configuration
- Verify that activity tracking is working
- Check if the session extension is being called

## API Reference

### SessionManager Methods
- `saveSession(sessionData)`: Save session to localStorage
- `loadSession()`: Load session from localStorage
- `clearSession()`: Clear session from localStorage
- `isSessionValid()`: Check if session is valid
- `getSessionData()`: Get raw session data
- `extendSession()`: Extend session duration

### useSession Hook Returns
- `isAuthenticated`: Boolean indicating authentication status
- `user`: User object from session
- `loading`: Loading state
- `error`: Error state
- `logout()`: Function to logout user
- `clearSession()`: Function to clear session manually
- `getSessionInfo()`: Function to get session information
- `isSessionValid()`: Function to check session validity
