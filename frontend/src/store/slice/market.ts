import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Market {
  id: number;
  title: string;
  participants: string[];
  participantImages?: string;
  status: string;
  startTime?: string | null;
  endTime?: string | null;
  calendar?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MarketState {
  markets: Market[];
  loading: boolean;
  error: string | null;
}

const initialState: MarketState = {
  markets: [],
  loading: false,
  error: null,
};

const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    fetchMarketsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMarketsSuccess: (state, action: PayloadAction<Market[]>) => {
       state.markets = action.payload;
      //state.markets=localStorage.setItem('mark')
      state.loading = false;
      state.error = null;
    },
    fetchMarketsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.markets = [];
    },
    clearMarketsError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchMarketsRequest,
  fetchMarketsSuccess,
  fetchMarketsFailure,
  clearMarketsError,
} = marketSlice.actions;

export const marketReducer = marketSlice.reducer;




