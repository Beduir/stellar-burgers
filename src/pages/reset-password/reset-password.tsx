import {
  clearPasswordResetError,
  resetPasswordThunk,
  selectPasswordResetError,
  selectPasswordResetLoading,
} from '@slices/userSlice';
import { Preloader } from '@ui';
import { ResetPasswordUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const ResetPassword = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const dispatch = useDispatch();
  const error = useSelector(selectPasswordResetError);
  const isLoading = useSelector(selectPasswordResetLoading);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;

    void dispatch(resetPasswordThunk({ password, token })).then((action) => {
      if (resetPasswordThunk.fulfilled.match(action)) {
        void navigate('/login');
      }
    });
  };

  useEffect(() => {
    dispatch(clearPasswordResetError());
  }, [dispatch]);

  useEffect(() => {
    if (!localStorage.getItem('resetPassword')) {
      void navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  if (isLoading) return <Preloader />;

  return (
    <ResetPasswordUI
      errorText={error?.message}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
