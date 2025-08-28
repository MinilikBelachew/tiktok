import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null as User | null,
  loading: false,
  error: null,
};

// Define user type
export interface User {
  id: number;
  email: string;
  phone?: string;
  username?: string;
  role: 'USER' | 'ADMIN';
}

// Define the type for the payload that registerRequest will accept
interface RegisterPayload {
  email: string;
  phone: string;
  password: string;
  username: string; // Optional field for username
}

interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // The registerRequest action now expects a payload of type RegisterPayload
    registerRequest: (state, _action: PayloadAction<RegisterPayload>) => {
      state.loading = true;
      state.error = null;
    },
    // The rest of your reducers...
    registerSucess: (state, action: PayloadAction<{ user: User }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.loading = false;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
    },
    loginRequest: (state, _action: PayloadAction<LoginPayload>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User }>) => {
      console.log('AuthSlice - Login success, setting authentication state');
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.loading = false;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
    },
    resetPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.loading = false;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    logout(state) {
      console.log('AuthSlice - Logout action triggered, clearing authentication state');
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      
      // Clear any stored authentication data
      if (typeof window !== 'undefined') {
        console.log('AuthSlice - Clearing browser storage and cookies...');
        localStorage.removeItem('auth');
        sessionStorage.clear();
        
        // Clear cookies by setting them to expire with multiple domain/path combinations
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;";
      }
      
      console.log('AuthSlice - Authentication state cleared');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserData: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
      console.log('AuthSlice - User data updated from backend');
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.loading = false;
      state.error = null;
      console.log('AuthSlice - Authentication state set from backend validation');
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  clearError,
  registerRequest,
  logoutRequest,
  registerSucess,
  registerFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  resetPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  updateUserData,
  setAuthenticated,
  setAuthLoading,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
