import type en from '../../messages/en-US.json';

type Messages = typeof en;

declare global {
  interface IntlMessages extends Messages {}
}
