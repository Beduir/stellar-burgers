import {
  clearPasswordRecoveryError,
  forgotPasswordThunk,
  selectPasswordRecoveryError,
  selectPasswordRecoveryLoading,
} from '@slices/userSlice';
import { Preloader } from '@ui';
import { ForgotPasswordUI } from '@ui-pages';
import { useEffect, useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const ForgotPassword = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const error = useSelector(selectPasswordRecoveryError);
  const isLoading = useSelector(selectPasswordRecoveryLoading);

  const navigate = useNavigate();

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;

    void dispatch(forgotPasswordThunk({ email })).then((action) => {
      if (forgotPasswordThunk.fulfilled.match(action)) {
        void navigate('/reset-password', { replace: true });
      }
    });
  };

  useEffect(() => {
    dispatch(clearPasswordRecoveryError());
  }, [dispatch]);

  if (isLoading) return <Preloader />;

  return (
    <ForgotPasswordUI
      errorText={error?.message}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
