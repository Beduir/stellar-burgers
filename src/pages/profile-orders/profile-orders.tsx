import {
  selectIngredientsError,
  selectIngredientsLoading,
} from '@slices/ingredientsSlice';
import { getProfileOrdersThunk, selectProfileOrders } from '@slices/profileOrdersSlice';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';
import { ordersRefreshIntervalMs } from '@utils/constants';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectProfileOrders);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(getProfileOrdersThunk());
    const interval = setInterval(() => {
      void dispatch(getProfileOrdersThunk());
    }, ordersRefreshIntervalMs);
    return (): void => clearInterval(interval);
  }, [dispatch]);

  return (
    <ProfileOrdersUI
      orders={orders}
      isLoading={isIngredientsLoading || (isLoading && !orders.length)}
      errorText={error?.message ?? ingredientsError?.message}
    />
  );
};
