import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute,
} from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import {
  getIngredientsThunk,
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@slices/ingredientsSlice';
import { checkUserThunk } from '@slices/userSlice';
import { Preloader } from '@ui';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { AppContentProps, AppLocationState } from './type';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(getIngredientsThunk());
    void dispatch(checkUserThunk());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <RouteComponent
        ingredients={ingredients}
        isLoading={isIngredientsLoading}
        error={ingredientsError}
      />
    </div>
  );
};

export default App;

const AppContent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
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

const RouteComponent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as AppLocationState | null;
  const background = state?.background;
  const orderTitle = location.pathname.split('/').pop() ?? '';

  const closeModal = (): void => {
    void navigate(-1);
  };

  return (
    <>
      <Routes location={background ?? location}>
        <Route
          path="/"
          element={
            <AppContent ingredients={ingredients} isLoading={isLoading} error={error} />
          }
        />
        <Route path="/feed" element={<Feed />} />
        <Route
          path="/ingredients/:id"
          element={
            <main className={styles.detailPageWrap}>
              <h1 className={clsx(styles.detailHeader, 'text text_type_main-large')}>
                Детали ингредиента
              </h1>
              <IngredientDetails />
            </main>
          }
        />
        <Route
          path="/feed/:number"
          element={
            <main className={styles.detailPageWrap}>
              <h1 className={clsx(styles.detailHeader, 'text text_type_digits-default')}>
                {orderTitle}
              </h1>
              <OrderInfo />
            </main>
          }
        />
        <Route element={<ProtectedRoute onlyUnAuth />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/orders" element={<ProfileOrders />} />
          <Route
            path="/profile/orders/:number"
            element={
              <main className={styles.detailPageWrap}>
                <h1
                  className={clsx(styles.detailHeader, 'text text_type_digits-default')}
                >
                  {orderTitle}
                </h1>
                <OrderInfo />
              </main>
            }
          />
        </Route>
        <Route path="*" element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={closeModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={
              <Modal title={orderTitle} onClose={closeModal}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/profile/orders/:number"
              element={
                <Modal title={orderTitle} onClose={closeModal}>
                  <OrderInfo />
                </Modal>
              }
            />
          </Route>
        </Routes>
      )}
    </>
  );
};
