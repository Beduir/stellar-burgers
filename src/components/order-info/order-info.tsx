import { selectFeed } from '@slices/feedSlice';
import { selectIngredients, selectIngredientsError } from '@slices/ingredientsSlice';
import { getOrderThunk, selectOrder, selectOrderError } from '@slices/orderSlice';
import { selectProfileOrders } from '@slices/profileOrdersSlice';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const { pathname } = useLocation();
  const orderNumber = Number(number);
  const loadedOrder = useSelector(selectOrder);
  const { orders: feedOrders } = useSelector(selectFeed);
  const { orders: profileOrders } = useSelector(selectProfileOrders);
  const feedOrder = feedOrders.find((order) => order.number === orderNumber);
  const profileOrder = profileOrders.find((order) => order.number === orderNumber);
  const orderFromList = pathname.startsWith('/profile/orders')
    ? (profileOrder ?? feedOrder)
    : (feedOrder ?? profileOrder);
  const orderData = orderFromList ?? loadedOrder;
  const ingredients = useSelector(selectIngredients);
  const error = useSelector(selectOrderError);
  const ingredientsError = useSelector(selectIngredientsError);
  const isValidNumber = Number.isSafeInteger(orderNumber) && orderNumber > 0;

  useEffect(() => {
    if (!isValidNumber || orderFromList) return;
    void dispatch(getOrderThunk(orderNumber));
  }, [dispatch, orderNumber, isValidNumber, orderFromList]);

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

  if ((!orderFromList && error) || ingredientsError) {
    return (
      <p className="text text_type_main-default">
        {ingredientsError?.message ?? error?.message}
      </p>
    );
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
