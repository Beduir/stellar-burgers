import {
  clearUserUpdateError,
  selectUser,
  selectUserUpdateError,
  selectUserUpdating,
  updateUserThunk,
} from '@slices/userSlice';
import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { TRegisterData } from '@api';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isUpdating = useSelector(selectUserUpdating);
  const updateError = useSelector(selectUserUpdateError);

  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });

  useEffect(() => {
    setFormValue((prevState) => ({
      ...prevState,
      name: user?.name ?? '',
      email: user?.email ?? '',
    }));
  }, [user?.name, user?.email]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (!user || !isFormChanged || isUpdating) return;

    const data: Partial<TRegisterData> = {};
    if (formValue.name !== user.name) data.name = formValue.name;
    if (formValue.email !== user.email) data.email = formValue.email;
    if (formValue.password) data.password = formValue.password;

    void dispatch(updateUserThunk(data)).then((action) => {
      if (updateUserThunk.fulfilled.match(action)) {
        setFormValue({ ...action.payload, password: '' });
      }
    });
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();
    dispatch(clearUserUpdateError());
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      isUpdating={isUpdating}
      updateUserError={updateError?.message}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
