import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { logoutUserThunk } from './userSlice';

import type { SerializedError } from '@reduxjs/toolkit';
import type { TOrder } from '@utils-types';

type OrderState = {
  createdOrder: TOrder | null;
  isCreating: boolean;
  createError: SerializedError | null;
  createRequestId: string | null;
  order: TOrder | null;
  isLoading: boolean;
  error: SerializedError | null;
  requestId: string | null;
  requestedNumber: number | null;
};

const initialState: OrderState = {
  createdOrder: null,
  isCreating: false,
  createError: null,
  createRequestId: null,
  order: null,
  isLoading: false,
  error: null,
  requestId: null,
  requestedNumber: null,
};

export const createOrderThunk = createAsyncThunk<
  TOrder,
  string[],
  { state: { order: OrderState } }
>(
  'order/create',
  async (ingredients): Promise<TOrder> => {
    const response = await orderBurgerApi(ingredients);
    return { ...response.order, ingredients };
  },
  {
    condition: (_, { getState }): boolean => !getState().order.isCreating,
  }
);

export const getOrderThunk = createAsyncThunk<
  TOrder,
  number,
  { state: { order: OrderState } }
>(
  'order/getByNumber',
  async (number: number): Promise<TOrder> => {
    const response = await getOrderByNumberApi(number);
    if (!response.success || !response.orders.length) {
      throw new Error('Заказ не найден');
    }
    return response.orders[0];
  },
  {
    condition: (number, { getState }): boolean => {
      const { isLoading, requestedNumber } = getState().order;
      return !isLoading || requestedNumber !== number;
    },
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetCreatedOrder: (state) => {
      state.createdOrder = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderThunk.pending, (state, action) => {
        state.isCreating = true;
        state.createdOrder = null;
        state.createError = null;
        state.createRequestId = action.meta.requestId;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        if (state.createRequestId !== action.meta.requestId) return;
        state.createdOrder = action.payload;
        state.isCreating = false;
        state.createRequestId = null;
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        if (state.createRequestId !== action.meta.requestId) return;
        state.createError = action.error;
        state.isCreating = false;
        state.createRequestId = null;
      })
      .addCase(getOrderThunk.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
        state.requestedNumber = action.meta.arg;
        if (state.order?.number !== action.meta.arg) state.order = null;
      })
      .addCase(getOrderThunk.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.order = action.payload;
        state.isLoading = false;
      })
      .addCase(getOrderThunk.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.error = action.error;
        state.isLoading = false;
      })
      .addCase(logoutUserThunk.fulfilled, () => initialState);
  },
  selectors: {
    selectCreatedOrder: (state): TOrder | null => state.createdOrder,
    selectOrderCreating: (state): boolean => state.isCreating,
    selectOrderCreateError: (state): SerializedError | null => state.createError,
    selectOrder: (state): TOrder | null => state.order,
    selectOrderLoading: (state): boolean => state.isLoading,
    selectOrderError: (state): SerializedError | null => state.error,
  },
});

export const { resetCreatedOrder } = orderSlice.actions;
export const {
  selectCreatedOrder,
  selectOrderCreating,
  selectOrderCreateError,
  selectOrder,
  selectOrderLoading,
  selectOrderError,
} = orderSlice.selectors;

export default orderSlice.reducer;
