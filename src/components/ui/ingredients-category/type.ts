import type { TIngredientsCategoryProps } from '@components/ingredients-category/type';

export type TIngredientsCategoryUIProps = TIngredientsCategoryProps & {
  ingredientsCounters: Record<string, number>;
};
