import { selectConstructorItems } from '@slices/constructorSlice';
import { getFeedThunk } from '@slices/feedSlice';
import {
  createOrderThunk,
  resetCreatedOrder,
  selectCreatedOrder,
  selectOrderCreateError,
  selectOrderCreating,
} from '@slices/orderSlice';
import { getProfileOrdersThunk } from '@slices/profileOrdersSlice';
import { selectAuthChecked, selectUser } from '@slices/userSlice';
import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';
import { bunCount } from '@utils/constants';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectAuthChecked);
  const location = useLocation();
  const navigate = useNavigate();
  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderCreating);
  const orderModalData = useSelector(selectCreatedOrder);
  const orderError = useSelector(selectOrderCreateError);

  const onOrderClick = (): void => {
    if (!isAuthChecked) return;

    if (!user) {
      void navigate('/login', { state: { from: location } });
      return;
    }

    if (!constructorItems.bun || orderRequest) return;
    const ingredients = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id,
    ];
    void dispatch(createOrderThunk(ingredients)).then((action) => {
      if (createOrderThunk.fulfilled.match(action)) {
        void dispatch(getFeedThunk());
        void dispatch(getProfileOrdersThunk());
      }
    });
  };

  const closeOrderModal = (): void => {
    dispatch(resetCreatedOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * bunCount : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      orderError={orderError?.message}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
