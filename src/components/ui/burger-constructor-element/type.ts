import type { BurgerConstructorElementProps } from '@components/burger-constructor-element/type';

export type BurgerConstructorElementUIProps = BurgerConstructorElementProps & {
  handleMoveUp: () => void;
  handleMoveDown: () => void;
  handleClose: () => void;
};
