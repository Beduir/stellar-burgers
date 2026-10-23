import type { TIngredient, TOrder, TBackgroundLocationState } from '@utils-types';

export type OrderCardUIProps = {
  orderInfo: TOrderInfo;
  maxIngredients: number;
  locationState: TBackgroundLocationState;
};

type TOrderInfo = TOrder & {
  ingredientsInfo: TIngredient[];
  ingredientsToShow: TIngredient[];
  remains: number;
  total: number;
  date: Date;
};
