import { selectIngredients, selectIngredientsError } from '@slices/ingredientsSlice';
import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { useSelector } from '@services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams();
  const ingredients = useSelector(selectIngredients);
  const error = useSelector(selectIngredientsError);
  const ingredientData = ingredients.find((ingredient) => ingredient._id === id);

  if (error) {
    return (
      <p className="text text_type_main-default">
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
