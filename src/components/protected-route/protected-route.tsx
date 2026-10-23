import { selectAuthChecked, selectUser } from '@slices/userSlice';
import { Preloader } from '@ui';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

import type { Location } from 'react-router-dom';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
};

type ProtectedRouteState = {
  from?: Location;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
}: ProtectedRouteProps): React.JSX.Element => {
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectAuthChecked);
  const location = useLocation();
  const state = location.state as ProtectedRouteState | null;

  if (!isAuthChecked) return <Preloader />;

  if (onlyUnAuth && user) {
    return <Navigate to={state?.from ?? '/'} replace />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
