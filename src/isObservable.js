import { Observable } from 'rx';

export default function isObservable(val) {
  return val instanceof Observable;
}
