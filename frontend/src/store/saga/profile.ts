import { call, put, takeLatest, select } from "redux-saga/effects";
import apiClient from "../../utils/axios";

import {
  deleteProfileFailure,
  deleteProfleRequest,
  getProfileFailure,
  getprofileRequest,
  getProfileSucess,
  updateProfileFailure,
  updateProfleRequest,
  updateProfileSuccess,
} from "../slice/profile";
import { updateUserData } from "../slice/auth";

//axios.defaults.withCredentials = true; // This line is removed as per the new_code

function* getProfileSaga(): Generator<any, void, any> {
  try {
    console.log('ProfileSaga - Fetching user profile...');
    const response = yield call(apiClient.get, `api/user/profile`);
    console.log('ProfileSaga - Profile response:', response.data);
    
    if (response.data && response.data.user) {
      console.log('ProfileSaga - User data received:', response.data.user);
      yield put(getProfileSucess(response.data));
    } else {
      console.log('ProfileSaga - No user data in response');
      yield put(getProfileFailure('No user data received'));
    }
  } catch (error: any) {
    console.error('ProfileSaga - Error fetching profile:', error);
    const message = error?.response?.data?.message || "Failed to fetch profile";
    yield put(getProfileFailure(message));
  }
}

function* updateProfileSaga(action: any): Generator<any, void, any> {
  try {
    const { email, phone, bio, username, avatarFile } = action.payload || {};
    console.log('ProfileSaga - Updating profile with:', { email, phone, bio, username, avatarFile });
    
    const formData = new FormData();
    if (email) formData.append("email", email);
    if (phone) formData.append("phone", phone);
    if (bio) formData.append("bio", bio);
    if (username) formData.append("username", username);
    if (avatarFile) formData.append("profileImage", avatarFile);

    console.log('ProfileSaga - Sending update request...');
    const response = yield call(
      apiClient.put,
      `api/user/profile`,
      formData
    );

    console.log('ProfileSaga - Update response:', response.data);
    yield put(updateProfileSuccess(response.data));
    
    // Also update the global auth.user to keep ProfilePage in sync.
    const currentAuthUser = yield select((state: any) => state.auth.user);
    const mergedUser = { ...(currentAuthUser || {}), ...(response.data?.user || {}) };
    console.log('ProfileSaga - Merging user data:', mergedUser);
    yield put(updateUserData({ user: mergedUser }));
  } catch (error: any) {
    console.error('ProfileSaga - Error updating profile:', error);
    const message = error?.response?.data?.message || "Failed to update profile";
    yield put(updateProfileFailure(message));
  }
}

function* deleteProfileSaga(): Generator<any, void, any> {
  try {
    yield call(apiClient.delete, `api/user/profile`);
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to delete account";
    yield put(deleteProfileFailure(message));
  }
}

function* wachGetUserInfoSaga(): Generator<any, void, any> {
  yield takeLatest(getprofileRequest.type, getProfileSaga);
}

function* wachUpdateUserInfoSaga(): Generator<any, void, any> {
  yield takeLatest(updateProfleRequest.type, updateProfileSaga);
}

function* wachDeleteSaga(): Generator<any, void, any> {
  yield takeLatest(deleteProfleRequest.type, deleteProfileSaga);
}

export {
  wachGetUserInfoSaga,
  wachUpdateUserInfoSaga,
  wachDeleteSaga,
};
