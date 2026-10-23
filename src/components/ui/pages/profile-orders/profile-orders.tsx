import { ProfileMenu, OrdersList } from '@components';
import { Preloader } from '@ui';
import { clsx } from 'clsx';

import type { ProfileOrdersUIProps } from './type';

import styles from './profile-orders.module.css';

export const ProfileOrdersUI = ({
  orders,
  isLoading,
  errorText,
}: ProfileOrdersUIProps): React.JSX.Element => (
  <main className={clsx(styles.main)}>
    <div className={clsx('mt-30 mr-15', styles.menu)}>
      <ProfileMenu />
    </div>
    <div className={clsx('mt-10', styles.orders)}>
      {errorText && <p className="text text_type_main-default">{errorText}</p>}
      {isLoading ? <Preloader /> : <OrdersList orders={orders} />}
    </div>
  </main>
);
