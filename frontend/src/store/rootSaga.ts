import { all } from "redux-saga/effects";
import {
  wachLoginSaga,
  wachLogoutSaga,
  wachRegisterSaga,
  wachResetPasswordSaga,
} from "./saga/auth";
import {
  wachGetUserInfoSaga,
  wachUpdateUserInfoSaga,
  wachDeleteSaga,
} from "./saga/profile";
import { watchFetchMarketsSaga } from "./saga/market";
import { watchBetSagas } from "./saga/bet";

 function* rootSaga() {
  yield all([
    wachLoginSaga(),
    wachLogoutSaga(),
    wachRegisterSaga(),
    wachResetPasswordSaga(),
    wachGetUserInfoSaga(),
    wachUpdateUserInfoSaga(),
    wachDeleteSaga(),
    watchFetchMarketsSaga(),
    watchBetSagas(),
  ]);
}

export default rootSaga;