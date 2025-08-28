import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "./slice/auth";
import { profileReducer } from "./slice/profile";
import { marketReducer } from "./slice/market";
import { betReducer } from "./slice/bet";

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  market: marketReducer,
  bet: betReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;