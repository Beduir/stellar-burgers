import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { createOrderThunk } from './orderSlice';

import type { SerializedError } from '@reduxjs/toolkit';
import type { TOrdersData } from '@utils-types';

type FeedState = TOrdersData & {
  isLoading: boolean;
  error: SerializedError | null;
  requestId: string | null;
};

const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
  requestId: null,
};

export const getFeedThunk = createAsyncThunk<
  TOrdersData,
  void,
  { state: { feed: FeedState } }
>('feed/get', (): Promise<TOrdersData> => getFeedsApi(), {
  condition: (_, { getState }): boolean => !getState().feed.isLoading,
});

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeedThunk.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(getFeedThunk.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
        state.isLoading = false;
      })
      .addCase(getFeedThunk.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.error = action.error;
        state.isLoading = false;
      })
      .addCase(createOrderThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.requestId = null;
      });
  },
  selectors: {
    selectFeed: (state): FeedState => state,
  },
});

export const { selectFeed } = feedSlice.selectors;

export default feedSlice.reducer;
