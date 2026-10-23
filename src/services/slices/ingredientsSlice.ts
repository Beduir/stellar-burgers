import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { SerializedError } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';

type IngredientsState = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

const initialState: IngredientsState = {
  ingredients: [],
  isLoading: false,
  error: null,
};

export const getIngredientsThunk = createAsyncThunk(
  'ingredients/getIngredients',
  getIngredientsApi
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIngredientsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIngredientsThunk.fulfilled, (state, action) => {
        state.ingredients = action.payload;
        state.isLoading = false;
      })
      .addCase(getIngredientsThunk.rejected, (state, action) => {
        state.error = action.error;
        state.isLoading = false;
      });
  },
  selectors: {
    selectIngredients: (state): TIngredient[] => state.ingredients,
    selectIngredientsLoading: (state): boolean => state.isLoading,
    selectIngredientsError: (state): SerializedError | null => state.error,
  },
});

export const { selectIngredients, selectIngredientsLoading, selectIngredientsError } =
  ingredientsSlice.selectors;

export default ingredientsSlice.reducer;
