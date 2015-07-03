import { observableFromStore } from '../';
import { spy } from 'sinon';

// Mock createStore
function createStore(unsubscribeSpy) {
  let state;
  let subscribers = [];

  return {
    getState: () => state,
    dispatch(action) {
      // Just overwrite existing state
      state = action;
      subscribers.forEach(s => s());
    },
    subscribe(subscriber) {
      subscribers.push(subscriber);
      return unsubscribeSpy;
    }
  };
}

describe('observableFromStore()', () => {
  let store;
  let unsubscribe;

  beforeEach(() => {
    unsubscribe = spy();
    store = createStore(unsubscribe);
  });

  it('returns an observable sequence of store states', () => {
    const next = spy();
    observableFromStore(store).subscribe(next);

    store.dispatch(1);
    store.dispatch(2);
    store.dispatch(3);

    expect(next.args.map(args => args[0])).to.deep.equal([ 1, 2, 3 ]);
  });

  it('unsubscribes on complete', () => {
    const next = spy();
    const subscription = observableFromStore(store).subscribe(next);

    store.dispatch(1);
    store.dispatch(2);
    store.dispatch(3);

    expect(next.callCount).to.equal(3);
    subscription.dispose();
    expect(unsubscribe.calledOnce).to.be.true;

    store.dispatch(4);
    store.dispatch(5);
    store.dispatch(6);

    expect(next.callCount).to.equal(3);
  });
});
