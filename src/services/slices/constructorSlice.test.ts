import * as ingredients from '../../../tests/fixtures/ingredients.json';
import constructorReducer, {
  addIngredient,
  moveIngredient,
  removeIngredient,
} from './constructorSlice';
import { createOrderThunk } from './orderSlice';

import type { TConstructorState, TOrder } from '@utils-types';

const [bun, main, sauce] = ingredients;
const constructorBun = { ...bun, id: 'bun-id' };
const constructorMain = { ...main, id: 'main-id' };
const constructorSauce = { ...sauce, id: 'sauce-id' };
const initialState: TConstructorState = { bun: null, ingredients: [] };
const filledState: TConstructorState = {
  bun: constructorBun,
  ingredients: [constructorMain, constructorSauce],
};
const requestId = 'order-request';
const ingredientIds = [bun._id, main._id, sauce._id, bun._id];

describe('burgerConstructor', () => {
  it('возвращает начальное состояние для неизвестного экшена', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
    expect(constructorReducer(filledState, { type: 'UNKNOWN' })).toEqual(filledState);
  });

  it('добавляет булку отдельно от начинок', () => {
    const action = addIngredient(bun);
    const state = constructorReducer(initialState, action);

    expect(state).toEqual({ bun: action.payload, ingredients: [] });
    expect(state.bun?.id).toEqual(expect.any(String));
  });

  it('заменяет выбранную булку и сохраняет начинки', () => {
    const anotherBun = { ...bun, _id: 'another-bun', name: 'Другая булка' };
    const action = addIngredient(anotherBun);
    const state = constructorReducer(filledState, action);

    expect(state).toEqual({
      bun: action.payload,
      ingredients: [constructorMain, constructorSauce],
    });
  });

  it('добавляет начинку и соус, сохраняя выбранную булку', () => {
    const mainAction = addIngredient(main);
    const sauceAction = addIngredient(sauce);
    const stateWithMain = constructorReducer(
      { bun: constructorBun, ingredients: [] },
      mainAction
    );
    const state = constructorReducer(stateWithMain, sauceAction);

    expect(state).toEqual({
      bun: constructorBun,
      ingredients: [mainAction.payload, sauceAction.payload],
    });
  });

  it('создаёт разные id для двух одинаковых ингредиентов', () => {
    const firstAction = addIngredient(main);
    const secondAction = addIngredient(main);
    const stateWithFirst = constructorReducer(initialState, firstAction);
    const state = constructorReducer(stateWithFirst, secondAction);

    expect(state.ingredients).toEqual([firstAction.payload, secondAction.payload]);
    expect(state.ingredients[0].id).not.toBe(state.ingredients[1].id);
  });

  it('удаляет только выбранный экземпляр ингредиента по id', () => {
    const anotherMain = { ...main, id: 'another-main-id' };
    const previousState = {
      bun: constructorBun,
      ingredients: [constructorMain, anotherMain, constructorSauce],
    };

    const state = constructorReducer(
      previousState,
      removeIngredient(constructorMain.id)
    );

    expect(state).toEqual({
      bun: constructorBun,
      ingredients: [anotherMain, constructorSauce],
    });
  });

  it('сохраняет конструктор при удалении неизвестного id', () => {
    const state = constructorReducer(filledState, removeIngredient('unknown-id'));

    expect(state).toEqual(filledState);
  });

  it('перемещает ингредиент вверх', () => {
    const state = constructorReducer(
      filledState,
      moveIngredient({ id: constructorSauce.id, direction: 'up' })
    );

    expect(state).toEqual({
      bun: constructorBun,
      ingredients: [constructorSauce, constructorMain],
    });
    expect(filledState.ingredients).toEqual([constructorMain, constructorSauce]);
  });

  it('перемещает ингредиент вниз', () => {
    const state = constructorReducer(
      filledState,
      moveIngredient({ id: constructorMain.id, direction: 'down' })
    );

    expect(state).toEqual({
      bun: constructorBun,
      ingredients: [constructorSauce, constructorMain],
    });
  });

  it('не перемещает ингредиенты за границы списка', () => {
    const stateWithMoveUp = constructorReducer(
      filledState,
      moveIngredient({ id: constructorMain.id, direction: 'up' })
    );
    const stateWithMoveDown = constructorReducer(
      filledState,
      moveIngredient({ id: constructorSauce.id, direction: 'down' })
    );

    expect(stateWithMoveUp).toEqual(filledState);
    expect(stateWithMoveDown).toEqual(filledState);
  });

  it('сохраняет конструктор при перемещении неизвестного id', () => {
    const state = constructorReducer(
      filledState,
      moveIngredient({ id: 'unknown-id', direction: 'down' })
    );

    expect(state).toEqual(filledState);
  });

  it('сохраняет бургер во время оформления заказа', () => {
    const state = constructorReducer(
      filledState,
      createOrderThunk.pending(requestId, ingredientIds)
    );

    expect(state).toEqual(filledState);
  });

  it('сохраняет бургер при ошибке оформления заказа', () => {
    const state = constructorReducer(
      filledState,
      createOrderThunk.rejected(new Error('Ошибка оформления'), requestId, ingredientIds)
    );

    expect(state).toEqual(filledState);
  });

  it('очищает конструктор после успешного оформления заказа', () => {
    const order: TOrder = {
      _id: 'test-order',
      number: 12345,
      name: 'Тестовый бургер',
      status: 'pending',
      ingredients: ingredientIds,
      createdAt: '2026-01-01T12:00:00.000Z',
      updatedAt: '2026-01-01T12:00:00.000Z',
    };
    const state = constructorReducer(
      filledState,
      createOrderThunk.fulfilled(order, requestId, ingredientIds)
    );

    expect(state).toEqual(initialState);
  });
});
