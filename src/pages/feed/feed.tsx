import { getFeedThunk, selectFeed } from '@slices/feedSlice';
import {
  selectIngredientsError,
  selectIngredientsLoading,
} from '@slices/ingredientsSlice';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectFeed);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(getFeedThunk());
  }, [dispatch]);

  const handleGetFeeds = (): void => {
    void dispatch(getFeedThunk());
  };

  if (isIngredientsLoading || (isLoading && !orders.length)) {
    return <Preloader />;
  }

  return (
    <>
      {(error ?? ingredientsError) && (
        <p className="text text_type_main-default">
          {error?.message ?? ingredientsError?.message}
        </p>
      )}
      <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />
    </>
  );
};
