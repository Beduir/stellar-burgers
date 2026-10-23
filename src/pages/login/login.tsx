import {
  clearUserError,
  loginUserThunk,
  selectUserError,
  selectUserLoading,
} from '@slices/userSlice';
import { Preloader } from '@ui';
import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (isLoading) return;

    void dispatch(loginUserThunk({ email, password }));
  };

  if (isLoading) return <Preloader />;

  return (
    <LoginUI
      errorText={error?.message ?? ''}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
