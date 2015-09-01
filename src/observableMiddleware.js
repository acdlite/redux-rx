import { isFSA } from 'flux-standard-action';
import isObservable from './isObservable';

export default function observableMiddleware() {
  return next => action => {
    if (!isFSA(action)) {
      return isObservable(action)
        ? action.doOnNext(next)
        : next(action);
    }

    return isObservable(action.payload)
      ? action.payload
          .doOnNext(x => next({ ...action, payload: x }))
          .doOnError(e => next({ ...action, payload: e, error: true }))
      : next(action);
  };
}
