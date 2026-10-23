import type { SerializedError } from '@reduxjs/toolkit';
import type { TBackgroundLocationState, TIngredient } from '@utils-types';

export type AppContentProps = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

export type AppLocationState = Partial<TBackgroundLocationState>;
