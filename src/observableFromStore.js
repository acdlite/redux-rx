import { Observable } from 'rx';

export default function observableFromStore(store) {
  return Observable.create(observer =>
    store.subscribe(() => observer.onNext(store.getState()))
  );
}
