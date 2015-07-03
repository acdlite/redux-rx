redux-rx
========

[![build status](https://img.shields.io/travis/acdlite/redux-rx/master.svg?style=flat-square)](https://travis-ci.org/acdlite/redux-rx)
[![npm version](https://img.shields.io/npm/v/redux-rx.svg?style=flat-square)](https://www.npmjs.com/package/redux-rx)

[FSA](https://github.com/acdlite/flux-standard-action)-compliant promise [middleware](https://github.com/gaearon/redux/blob/master/docs/middleware.md) for Redux.

```js
npm install --save redux-rx
```

## Usage

```js
import { observableMiddleware } from 'redux-rx';
```

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
