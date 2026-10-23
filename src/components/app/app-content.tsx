import { ConstructorPage } from '@pages';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@slices/ingredientsSlice';
import { Preloader } from '@ui';
import { clsx } from 'clsx';

import { useSelector } from '@services/store';

import styles from './app-content.module.css';

export const AppContent = (): React.JSX.Element => {
  const ingredients = useSelector(selectIngredients);
  const isLoading = useSelector(selectIngredientsLoading);
  const error = useSelector(selectIngredientsError);

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={clsx(styles.message, 'text text_type_main-medium')}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={clsx(styles.message, 'text text_type_main-medium')}>
        Нет ингредиентов
      </p>
    );
  }

  return <ConstructorPage />;
};
