import { selectIngredients, selectIngredientsError } from '@slices/ingredientsSlice';
import { getOrderThunk, selectOrder, selectOrderError } from '@slices/orderSlice';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';
import { ordersRefreshIntervalMs } from '@utils/constants';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderNumber = Number(number);
  const orderData = useSelector(selectOrder);
  const ingredients = useSelector(selectIngredients);
  const error = useSelector(selectOrderError);
  const ingredientsError = useSelector(selectIngredientsError);
  const isValidNumber = Number.isSafeInteger(orderNumber) && orderNumber > 0;

  useEffect(() => {
    if (!isValidNumber) return;
    void dispatch(getOrderThunk(orderNumber));
    const interval = setInterval(() => {
      void dispatch(getOrderThunk(orderNumber));
    }, ordersRefreshIntervalMs);
    return (): void => clearInterval(interval);
  }, [dispatch, orderNumber, isValidNumber]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || orderData.number !== orderNumber || !ingredients.length)
      return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients, orderNumber]);

  if (!isValidNumber) {
    return <p className="text text_type_main-default">Заказ не найден</p>;
  }

  if (error || ingredientsError) {
    return (
      <p className="text text_type_main-default">
        {error?.message ?? ingredientsError?.message}
      </p>
    );
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
