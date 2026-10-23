import * as ingredients from '../../../tests/fixtures/ingredients.json';
import ingredientsReducer, { getIngredientsThunk } from './ingredientsSlice';

const requestId = 'ingredients-request';

describe('ingredientsSlice', () => {
  it('возвращает начальное состояние для неизвестного экшена', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: null,
    });
  });

  it('при pending включает загрузку и сбрасывает предыдущую ошибку', () => {
    const previousState = {
      ingredients,
      isLoading: false,
      error: { message: 'Предыдущая ошибка' },
    };

    const state = ingredientsReducer(
      previousState,
      getIngredientsThunk.pending(requestId)
    );

    expect(state).toEqual({
      ingredients,
      isLoading: true,
      error: null,
    });
  });

  it('при fulfilled заменяет ингредиенты полученными и выключает загрузку', () => {
    const previousState = {
      ingredients: [ingredients[0]],
      isLoading: true,
      error: null,
    };

    const state = ingredientsReducer(
      previousState,
      getIngredientsThunk.fulfilled(ingredients, requestId)
    );

    expect(state).toEqual({
      ingredients,
      isLoading: false,
      error: null,
    });
  });

  it('при rejected сохраняет ошибку и выключает загрузку', () => {
    const error = new Error('Не удалось загрузить ингредиенты');
    const previousState = {
      ingredients,
      isLoading: true,
      error: null,
    };

    const state = ingredientsReducer(
      previousState,
      getIngredientsThunk.rejected(error, requestId)
    );

    expect(state.isLoading).toBe(false);
    expect(state.error?.message).toBe(error.message);
    expect(state.ingredients).toEqual(ingredients);
  });
});
