import { isFSA } from 'flux-standard-action';
import { Observable } from 'rx';

function isObservable(val) {
  return val instanceof Observable;
}

export function observableMiddleware(next) {
  return action => {
    if (!isFSA(action)) {
      return isObservable(action)
        ? action.doOnNext(next)
        : next(action);
    }

    return isObservable(action.payload)
      ? action.payload
          .doOnNext(x => next({ ...action, payload: x, status: 'success' }))
          .doOnError(e => next({ ...action, payload: e, status: 'error' }))
      : next(action);
  };
}

export function observableFromStore(store) {
  return Observable.create(observer =>
    store.subscribe(() => observer.onNext(store.getState()))
  );
}
