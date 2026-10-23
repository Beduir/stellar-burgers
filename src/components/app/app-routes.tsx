import { IngredientDetails, Modal, OrderInfo, ProtectedRoute } from '@components';
import {
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { clsx } from 'clsx';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { AppContent } from './app-content';

import type { AppLocationState } from './type';

import styles from './app-routes.module.css';

export const AppRoutes = (): React.JSX.Element => {
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
        <Route path="/" element={<AppContent />} />
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
