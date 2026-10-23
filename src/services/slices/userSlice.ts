import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  resetPasswordApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { SerializedError } from '@reduxjs/toolkit';
import type { TUser } from '@utils-types';

type PasswordRequestState = {
  isLoading: boolean;
  error: SerializedError | null;
};

type UserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: SerializedError | null;
  isUpdating: boolean;
  updateError: SerializedError | null;
  updateRequestId: string | null;
  passwordRecovery: PasswordRequestState;
  passwordReset: PasswordRequestState;
};

const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
  isUpdating: false,
  updateError: null,
  updateRequestId: null,
  passwordRecovery: { isLoading: false, error: null },
  passwordReset: { isLoading: false, error: null },
};

export const checkUserThunk = createAsyncThunk<
  TUser | null,
  void,
  { state: { user: UserState } }
>(
  'user/checkUser',
  async (): Promise<TUser | null> => {
    const accessToken = getCookie('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');

    if (!accessToken && !savedRefreshToken) return null;

    try {
      const response = await getUserApi();
      if (!response.success) throw new Error('Не удалось проверить пользователя');

      return response.user;
    } catch (error) {
      deleteCookie('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },
  {
    condition: (_, { getState }): boolean => {
      const { isAuthChecked, isLoading } = getState().user;
      return !isAuthChecked && !isLoading;
    },
  }
);

export const loginUserThunk = createAsyncThunk(
  'user/login',
  async (data: TLoginData): Promise<TUser> => {
    const response = await loginUserApi(data);
    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  }
);

export const registerUserThunk = createAsyncThunk(
  'user/register',
  async (data: TRegisterData): Promise<TUser> => {
    const response = await registerUserApi(data);
    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  }
);

export const logoutUserThunk = createAsyncThunk(
  'user/logout',
  async (): Promise<void> => {
    const response = await logoutApi();
    if (!response.success) throw new Error('Не удалось выйти из аккаунта');

    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
  }
);

export const updateUserThunk = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  { state: { user: UserState } }
>(
  'user/update',
  async (data): Promise<TUser> => {
    const response = await updateUserApi(data);
    if (!response.success) throw new Error('Не удалось сохранить данные пользователя');
    return response.user;
  },
  {
    condition: (_, { getState }): boolean => !getState().user.isUpdating,
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  'user/forgotPassword',
  async (data: Parameters<typeof forgotPasswordApi>[0]): Promise<void> => {
    await forgotPasswordApi(data);
    localStorage.setItem('resetPassword', 'true');
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'user/resetPassword',
  async (data: Parameters<typeof resetPasswordApi>[0]): Promise<void> => {
    await resetPasswordApi(data);
    localStorage.removeItem('resetPassword');
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearPasswordRecoveryError: (state) => {
      state.passwordRecovery.error = null;
    },
    clearPasswordResetError: (state) => {
      state.passwordReset.error = null;
    },
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserUpdateError: (state) => {
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.passwordRecovery.isLoading = true;
        state.passwordRecovery.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.passwordRecovery.isLoading = false;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.passwordRecovery.isLoading = false;
        state.passwordRecovery.error = action.error;
      })
      .addCase(resetPasswordThunk.pending, (state) => {
        state.passwordReset.isLoading = true;
        state.passwordReset.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.passwordReset.isLoading = false;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.error = action.error;
      })
      .addCase(checkUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
        state.isLoading = false;
      })
      .addCase(checkUserThunk.rejected, (state, action) => {
        state.user = null;
        state.isAuthChecked = true;
        state.isLoading = false;
        state.error = action.error;
      })
      .addCase(loginUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
        state.isLoading = false;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      })
      .addCase(registerUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
        state.isLoading = false;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      })
      .addCase(logoutUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthChecked = true;
        state.isLoading = false;
        state.isUpdating = false;
        state.updateError = null;
        state.updateRequestId = null;
      })
      .addCase(logoutUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      })
      .addCase(updateUserThunk.pending, (state, action) => {
        state.isUpdating = true;
        state.updateError = null;
        state.updateRequestId = action.meta.requestId;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        if (state.updateRequestId !== action.meta.requestId) return;
        state.user = action.payload;
        state.isUpdating = false;
        state.updateRequestId = null;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        if (state.updateRequestId !== action.meta.requestId) return;
        state.isUpdating = false;
        state.updateError = action.error;
        state.updateRequestId = null;
      });
  },
  selectors: {
    selectPasswordRecoveryLoading: (state): boolean => state.passwordRecovery.isLoading,
    selectPasswordRecoveryError: (state): SerializedError | null =>
      state.passwordRecovery.error,
    selectPasswordResetLoading: (state): boolean => state.passwordReset.isLoading,
    selectPasswordResetError: (state): SerializedError | null =>
      state.passwordReset.error,
    selectUser: (state): TUser | null => state.user,
    selectAuthChecked: (state): boolean => state.isAuthChecked,
    selectUserLoading: (state): boolean => state.isLoading,
    selectUserError: (state): SerializedError | null => state.error,
    selectUserUpdating: (state): boolean => state.isUpdating,
    selectUserUpdateError: (state): SerializedError | null => state.updateError,
  },
});

export const {
  clearUserError,
  clearUserUpdateError,
  clearPasswordRecoveryError,
  clearPasswordResetError,
} = userSlice.actions;
export const {
  selectPasswordRecoveryLoading,
  selectPasswordRecoveryError,
  selectPasswordResetLoading,
  selectPasswordResetError,
  selectUser,
  selectAuthChecked,
  selectUserLoading,
  selectUserError,
  selectUserUpdating,
  selectUserUpdateError,
} = userSlice.selectors;

export default userSlice.reducer;
