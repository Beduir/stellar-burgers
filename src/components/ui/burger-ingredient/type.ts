import type { TBurgerIngredientProps } from '@components/burger-ingredient/type';
import type { TBackgroundLocationState } from '@utils-types';

export type TBurgerIngredientUIProps = TBurgerIngredientProps & {
  locationState: TBackgroundLocationState;
  handleAdd: () => void;
};
