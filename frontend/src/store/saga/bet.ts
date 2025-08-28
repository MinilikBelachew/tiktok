import { call, put, takeLatest, select } from "redux-saga/effects";
import apiClient from "../../utils/axios";
import {
  fetchMarketBetsRequest,
  fetchMarketBetsSuccess,
  fetchMarketBetsFailure,
  placeBetRequest,
  placeBetSuccess,
  placeBetFailure,
  fetchUserBetsRequest,
  fetchUserBetsSuccess,
  fetchUserBetsFailure,
} from "../slice/bet";

function* fetchMarketBetsSaga(action: ReturnType<typeof fetchMarketBetsRequest>): Generator<any, void, any> {
  try {
    const { marketId } = action.payload;
    const response = yield call(apiClient.get, `api/admin/bets/bet/${marketId}`);
    const bets = response.data?.bets || response.data || [];
    yield put(fetchMarketBetsSuccess({ marketId, bets }));
  } catch (error: any) {
    const err = error?.response?.data?.message || "Failed to fetch market bets";
    yield put(fetchMarketBetsFailure({ marketId: action.payload.marketId, error: err }));
  }
}

function* placeBetSaga(action: ReturnType<typeof placeBetRequest>): Generator<any, void, any> {
  try {
    const { marketId, amount, outcome } = action.payload;
    const response = yield call(apiClient.post, `api/admin/bets/create`, { marketId, amount, outcome });
    yield put(placeBetSuccess({ bet: response.data?.bet }));
    // Refresh market bets after placing
    yield put(fetchMarketBetsRequest({ marketId }));
    // Refresh user bets if we have user id
    const userId: number | undefined = yield select((state: any) => state.auth?.user?.id);
    if (userId) {
      yield put(fetchUserBetsRequest({ userId }));
    }
  } catch (error: any) {
    const err = error?.response?.data?.message || "Failed to place bet";
    yield put(placeBetFailure(err));
  }
}

function* fetchUserBetsSaga(action: ReturnType<typeof fetchUserBetsRequest>): Generator<any, void, any> {
  try {
    const { userId } = action.payload;
    const response = yield call(apiClient.get, `api/admin/bets/user/${userId}`);
    yield put(fetchUserBetsSuccess(response.data || []));
  } catch (error: any) {
    const err = error?.response?.data?.message || "Failed to fetch user bets";
    yield put(fetchUserBetsFailure(err));
  }
}

export function* watchBetSagas(): Generator<any, void, any> {
  yield takeLatest(fetchMarketBetsRequest.type, fetchMarketBetsSaga);
  yield takeLatest(placeBetRequest.type, placeBetSaga);
  yield takeLatest(fetchUserBetsRequest.type, fetchUserBetsSaga);
}


