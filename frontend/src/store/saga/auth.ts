import { call, put, takeLatest, delay } from "redux-saga/effects";
import apiClient from '../../utils/axios';
import { loginRequest, loginSuccess, loginFailure, logoutRequest, logout, registerFailure, registerRequest, registerSucess, resetPasswordSuccess, resetPasswordFailure, setAuthLoading } from '../slice/auth';

function* registerSaga(action: any): Generator<any, void, any> {

  try {
    console.log('RegisterSaga - Attempting to register with:', action.payload);
    const response = yield call(apiClient.post, `api/auth/register`, action.payload, {
      headers: {'Content-Type': 'application/json'}
    });
    console.log('RegisterSaga - Registration successful, response:', response.data);
    yield put(registerSucess(response.data));
}
catch(error:any){
    console.log('RegisterSaga - Registration failed:', error);
    console.log('RegisterSaga - Error response:', error?.response);
    const backendMessage = error?.response?.data?.message;
    const message = Array.isArray(backendMessage) ? backendMessage[0] : (backendMessage || 'Registration failed');
    console.log('RegisterSaga - Final error message:', message);
    yield put(registerFailure(message));
    
  }
}
function* loginSaga(action: any): Generator<any, void, any> {

  try {
    console.log('LoginSaga - Attempting to login with:', action.payload);
    const response = yield call(apiClient.post, `api/auth/login`, action.payload, {
      headers: {'Content-Type': 'application/json'}
    });
    console.log('LoginSaga - Login successful, response:', response.data);
    yield put(loginSuccess(response.data));
    console.log('LoginSaga - loginSuccess action dispatched');
}
catch(error:any){
    console.log('LoginSaga - Login failed:', error);
    const backendMessage = error?.response?.data?.message;
    const message = Array.isArray(backendMessage) ? backendMessage[0] : (backendMessage || 'Login failed');
    yield put(loginFailure(message));
    
  }
}
function* logoutSaga(action: any): Generator<any, void, any> {

  try {
    console.log('LogoutSaga - Starting logout process...');
    
    // Set loading state first
    yield put(setAuthLoading(true));
    
    console.log('LogoutSaga - Attempting to logout from server...');
    yield call(apiClient.post, `api/auth/logout`, action.payload, {
      headers: {'Content-Type': 'application/json'}
    });
    console.log('LogoutSaga - Server logout successful');
    
    // Clear any stored authentication data
    console.log('LogoutSaga - Clearing local storage and cookies...');
    localStorage.removeItem('auth');
    sessionStorage.clear();
    
    // Clear cookies by setting them to expire
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;";
    
    // Small delay to ensure cleanup is complete
    yield delay(200);
    
    console.log('LogoutSaga - Dispatching logout action...');
    yield put(logout());
    
    console.log('LogoutSaga - Logout process completed successfully');
  } catch (error:any) {
    console.log('LogoutSaga - Server logout failed, but clearing local state anyway:', error);
    // Even if logout API fails, clear client auth to avoid stuck loading
    
    // Clear any stored authentication data
    console.log('LogoutSaga - Clearing local storage and cookies despite server error...');
    localStorage.removeItem('auth');
    sessionStorage.clear();
    
    // Clear cookies by setting them to expire
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;";
    
    // Small delay to ensure cleanup is complete
    yield delay(200);
    
    console.log('LogoutSaga - Dispatching logout action despite server error...');
    yield put(logout());
    
    console.log('LogoutSaga - Logout process completed (with server error)');
  }
}

function* resetPasswordSaga(action: any): Generator<any, void, any> {
 
  try {
    const response = yield call(apiClient.post, `api/auth/reset-password`, action.payload, {
      headers: {'Content-Type': 'application/json'}
    });
    yield put(resetPasswordSuccess(response.data));
}
catch(error:any){
    const backendMessage = error?.response?.data?.message;
    const message = Array.isArray(backendMessage) ? backendMessage[0] : (backendMessage || 'Reset password failed');
    yield put(resetPasswordFailure(message));
    
  }
}

function* wachLoginSaga(): Generator<any, void, any> {
  yield takeLatest(loginRequest.type, loginSaga);
}

function* wachLogoutSaga(): Generator<any, void, any> {
  yield takeLatest(logoutRequest.type, logoutSaga);
}

function* wachRegisterSaga(): Generator<any, void, any> {
  yield takeLatest(registerRequest.type, registerSaga);
}

function* wachResetPasswordSaga(): Generator<any, void, any> {
  yield takeLatest('auth/resetPasswordRequest', resetPasswordSaga);
}

export {wachLoginSaga,wachLogoutSaga,wachRegisterSaga,wachResetPasswordSaga,}