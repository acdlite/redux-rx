redux-rx
========

[![build status](https://img.shields.io/travis/acdlite/redux-rx/master.svg?style=flat-square)](https://travis-ci.org/acdlite/redux-rx)
[![npm version](https://img.shields.io/npm/v/redux-rx.svg?style=flat-square)](https://www.npmjs.com/package/redux-rx)

RxJS utilities for Redux. Includes

- A utility to create Connector-like smart components using RxJS sequences.
  - A special version of `bindActionCreators()` that works with sequences.
- An [FSA](https://github.com/acdlite/flux-standard-action)-compliant observable [middleware](https://github.com/gaearon/redux/blob/master/docs/middleware.md)
- A utility to create a sequence of states from a Redux store.

```js
npm install --save redux-rx rx
```

## Usage

```js
import { createConnector } from 'redux-rx/react';
import { bindActionCreators, observableMiddleware, observableFromStore } from 'redux-rx';
```

## `createConnector(selectState, ?render)`

This lets you create Connector-like smart components using RxJS sequences. `selectState()` accepts three sequences as parameters

- `props$` - A sequence of props passed from the owner
- `state$` - A sequence of state from the Redux store
- `dispatch$` - A sequence representing the `dispatch()` method. In real-world usage, this should sequence only has a single value, but it's provided as a sequence for correctness.

`selectState()` should return a sequence of props that can be passed to the child. This provides a great integration point for [sideways data-loading](https://github.com/facebook/react/issues/3398).

Here's a simple example using web sockets:

```js
const TodoConnector = createConnector((props$, state$, dispatch$) => {
  // Special version of bindActionCreators that works with sequences; see below
  const actionCreators$ = bindActionCreators(actionCreators, dispatch$);
  const selectedState$ = state$.map(s => s.messages);

  // Connect to a websocket using rx-dom
  const $ws = fromWebSocket('ws://chat.foobar.org').map(e => e.data)
    .withLatestFrom(actionCreators$, (message, ac) =>
      () => ac.receiveMessage(message)
    )
    .do(dispatchAction => dispatchAction()); // Dispatch action for new messages

  return combineLatest(
    props$, selectedState$, actionCreators$, $ws,
    (props, selectedState, actionCreators) => ({
      ...props,
      ...selectedState,
      ...actionCreators
    }));
});
```

Pretty simple, right? Notice how there are no event handlers to clean up, no `componentWillReceiveProps()`, no `setState`. Everything is just a sequence.

If you're new to RxJS, this may look confusing at first, but — like React — if you give it a try you may be surprised by how simple and *fun* reactive programming can be.

**TODO: React Router example. See [this comment](https://github.com/gaearon/redux/issues/227#issuecomment-119237073) for now.**

`render()` is an optional second parameter which maps child props to a React element (vdom). This parameter can also be a React Component class — or, if you omit it entirely, a higher-order component is returned. See `createRxComponent()` of [react-rx-component](https://github.com/acdlite/react-rx-component) for more details. (This function is a wrapper around that library's `createRxComponent()`.)

Not that unlike Redux's built-in Connector, the resulting component does not have a `select` prop. It is superseded by the `selectState` function described above. Internally, `shouldComponentUpdate()` is still used for performance.

**NOTE** `createConnector()` is a wrapper around [react-rx-component](https://github.com/acdlite/react-rx-component). Check out that project for more information on how to use RxJS to construct smart components.

### `bindActionCreators(actionCreators, dispatch$)`

This is the same, except `dispatch$` can be either a dispatch function *or* a sequence of dispatch functions. See previous section for context.

### `observableMiddleware`

The middleware works on RxJS observables, and Flux Standard Actions whose payloads are observables.

The default export is a middleware function. If it receives a promise, it will dispatch the resolved value of the promise. It will not dispatch anything if the promise rejects.

If it receives an Flux Standard Action whose `payload` is an observable, it will

- dispatch a new FSA for each value in the sequence.
- dispatch an FSA on error.

The middleware does not subscribe to the passed observable. Rather, it returns the observable to the caller, which is responsible for creating a subscription. Dispatches occur as a side effect (implemented using `doOnNext()` and `doOnError()`).

#### Example

```js
// fromEvent() used just for illustration. More likely, if you're using React,
// you should use something rx-react's FuncSubject
// https://github.com/fdecampredon/rx-react#funcsubject
const buttonClickStream = Observable.fromEvent(button, 'click');

// Stream of new todos, with debouncing
const newTodoStream = buttonClickStream
  .debounce(100)
  .map(getTodoTextFromInput);

// Dispatch new todos whenever they're created
dispatch(newTodoStream).subscribe();
```

### `observableFromStore(store)`

Creates an observable sequence of states from a Redux store.

This is a great way to react to state changes outside of the React render cycle. See [this discussion](https://github.com/gaearon/redux/issues/177#issuecomment-115389776) for an example. I'll update with a proper example once React Router 1.0 is released.

Also, I'm not a Cycle.js user, but I imagine this is useful for integrating Redux with that library.
