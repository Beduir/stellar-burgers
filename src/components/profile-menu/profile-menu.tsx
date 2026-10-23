import { logoutUserThunk, selectUserError, selectUserLoading } from '@slices/userSlice';
import { Preloader, ProfileMenuUI } from '@ui';
import { useLocation } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const { pathname } = useLocation();

  const handleLogout = (): void => {
    if (isLoading) return;

    void dispatch(logoutUserThunk());
  };

  if (isLoading) return <Preloader />;

  return (
    <>
      <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />
      {error && <p className="text text_type_main-default">{error.message}</p>}
    </>
  );
};
