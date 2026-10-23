import { AppHeader } from '@components';
import { getIngredientsThunk } from '@slices/ingredientsSlice';
import { checkUserThunk } from '@slices/userSlice';
import { useEffect } from 'react';

import { useDispatch } from '@services/store';

import { AppRoutes } from './app-routes';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    void dispatch(getIngredientsThunk());
    void dispatch(checkUserThunk());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppRoutes />
    </div>
  );
};

export default App;
