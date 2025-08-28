import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface BetItem {
  id: number;
  marketId: number;
  userId: number;
  amount: number;
  outcome: string;
  status?: string;
  createdAt?: string;
}

interface BetsByMarketState {
  [marketId: string]: {
    bets: BetItem[];
    loading: boolean;
    error: string | null;
  };
}

interface BetState {
  byMarket: BetsByMarketState;
  placing: boolean;
  placeError: string | null;
  userBets: BetItem[];
  userLoading: boolean;
  userError: string | null;
}

const initialState: BetState = {
  byMarket: {},
  placing: false,
  placeError: null,
  userBets: [],
  userLoading: false,
  userError: null,
};

const betSlice = createSlice({
  name: "bet",
  initialState,
  reducers: {
    fetchMarketBetsRequest: (state, action: PayloadAction<{ marketId: string }>) => {
      const key = action.payload.marketId;
      if (!state.byMarket[key]) state.byMarket[key] = { bets: [], loading: false, error: null };
      state.byMarket[key].loading = true;
      state.byMarket[key].error = null;
    },
    fetchMarketBetsSuccess: (state, action: PayloadAction<{ marketId: string; bets: BetItem[] }>) => {
      const { marketId, bets } = action.payload;
      state.byMarket[marketId] = { bets, loading: false, error: null };
    },
    fetchMarketBetsFailure: (state, action: PayloadAction<{ marketId: string; error: string }>) => {
      const { marketId, error } = action.payload;
      if (!state.byMarket[marketId]) state.byMarket[marketId] = { bets: [], loading: false, error: null };
      state.byMarket[marketId].loading = false;
      state.byMarket[marketId].error = error;
    },

    placeBetRequest: (state, _action: PayloadAction<{ marketId: string; amount: number; outcome: string }>) => {
      state.placing = true;
      state.placeError = null;
    },
    placeBetSuccess: (state, _action: PayloadAction<{ bet: BetItem }>) => {
      state.placing = false;
    },
    placeBetFailure: (state, action: PayloadAction<string>) => {
      state.placing = false;
      state.placeError = action.payload;
    },

    fetchUserBetsRequest: (state, _action: PayloadAction<{ userId: number }>) => {
      state.userLoading = true;
      state.userError = null;
    },
    fetchUserBetsSuccess: (state, action: PayloadAction<BetItem[]>) => {
      state.userLoading = false;
      state.userBets = action.payload;
    },
    fetchUserBetsFailure: (state, action: PayloadAction<string>) => {
      state.userLoading = false;
      state.userError = action.payload;
      state.userBets = [];
    },
  },
});

export const {
  fetchMarketBetsRequest,
  fetchMarketBetsSuccess,
  fetchMarketBetsFailure,
  placeBetRequest,
  placeBetSuccess,
  placeBetFailure,
  fetchUserBetsRequest,
  fetchUserBetsSuccess,
  fetchUserBetsFailure,
} = betSlice.actions;

export const betReducer = betSlice.reducer;


