import type { TIngredient, TOrder } from '@utils-types';

export type OrderInfoUIProps = {
  orderInfo: TOrderInfo;
};

type TOrderInfo = TOrder & {
  ingredientsInfo: Record<string, TIngredient & { count: number }>;
  date: Date;
  total: number;
};
