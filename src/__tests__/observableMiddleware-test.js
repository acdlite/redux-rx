import { observableMiddleware } from '../';
import { spy } from 'sinon';
import { Observable } from 'rx';

function noop() {}

describe('observableMiddleware', () => {
  let baseDispatch;
  let dispatch;
  let error;
  let foobar;
  let stream;

  beforeEach(() => {
    baseDispatch = spy();
    dispatch = observableMiddleware()(baseDispatch);
    error = new Error();
    foobar = { foo: 'bar' };
    stream = Observable.concat(
      Observable.of(1, 2),
      Observable.throw(error),
      Observable.of(3)
    );
  });

  it('handles Flux standard actions', async () => {
    await dispatch({
      type: 'ACTION_TYPE',
      payload: stream
    }).toPromise().catch(noop);

    expect(baseDispatch.args.map(args => args[0])).to.deep.equal([
      { type: 'ACTION_TYPE', payload: 1 },
      { type: 'ACTION_TYPE', payload: 2 },
      { type: 'ACTION_TYPE', payload: error, error: true }
    ]);
  });

  it('handles observables', async () => {
    await dispatch(stream).toPromise().catch(noop);
    expect(baseDispatch.args.map(args => args[0])).to.deep.equal([ 1, 2 ]);
  });

  it('ignores non-observables', async() => {
    dispatch(foobar);
    expect(baseDispatch.firstCall.args[0]).to.equal(foobar);
  });
});
