import { getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { createOrderThunk } from './orderSlice';
import { logoutUserThunk } from './userSlice';

import type { SerializedError } from '@reduxjs/toolkit';
import type { TOrder } from '@utils-types';

type ProfileOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: SerializedError | null;
  requestId: string | null;
  createRequestId: string | null;
};

const initialState: ProfileOrdersState = {
  orders: [],
  isLoading: false,
  error: null,
  requestId: null,
  createRequestId: null,
};

export const getProfileOrdersThunk = createAsyncThunk<
  TOrder[],
  void,
  { state: { profileOrders: ProfileOrdersState } }
>('profileOrders/get', getOrdersApi, {
  condition: (_, { getState }): boolean => !getState().profileOrders.isLoading,
});

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProfileOrdersThunk.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(getProfileOrdersThunk.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.orders = [...action.payload].sort((a, b) => b.number - a.number);
        state.isLoading = false;
      })
      .addCase(getProfileOrdersThunk.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.error = action.error;
        state.isLoading = false;
      })
      .addCase(createOrderThunk.pending, (state, action) => {
        state.createRequestId = action.meta.requestId;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        if (state.createRequestId !== action.meta.requestId) return;
        state.createRequestId = null;
        state.orders = [
          action.payload,
          ...state.orders.filter((order) => order._id !== action.payload._id),
        ];
        state.isLoading = false;
        state.requestId = null;
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        if (state.createRequestId === action.meta.requestId)
          state.createRequestId = null;
      })
      .addCase(logoutUserThunk.fulfilled, () => initialState);
  },
  selectors: {
    selectProfileOrders: (state): ProfileOrdersState => state,
  },
});

export const { selectProfileOrders } = profileOrdersSlice.selectors;

export default profileOrdersSlice.reducer;
