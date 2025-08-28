import { call, put, takeLatest } from "redux-saga/effects";
import apiClient from "../../utils/axios";
import {
  fetchMarketsRequest,
  fetchMarketsSuccess,
  fetchMarketsFailure,
} from "../slice/market";

const API_BASE_URL = import.meta.env.VITE_API_URL;
//const API_BASE_URL = 'http://localhost:3000';

function* fetchMarketsSaga(): Generator<any, void, any> {
  try {
    const response = yield call(apiClient.get, `api/admin/markets/market/open`);
    yield put(fetchMarketsSuccess(response.data));
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to fetch markets";
    yield put(fetchMarketsFailure(message));
  }
}

function* watchFetchMarketsSaga(): Generator<any, void, any> {
  yield takeLatest(fetchMarketsRequest.type, fetchMarketsSaga);
}

export { watchFetchMarketsSaga };



