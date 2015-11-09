import createConnector from '../createConnector';
import { createStore, combineReducers } from 'redux';
import { bindActionCreators } from '../';
import { Provider } from 'react-redux';
import { Observable } from 'rx';
import { funcSubject } from 'react-rx-component';
import jsdom from './jsdom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

const { combineLatest } = Observable;

const actionCreators = {
  addTodo(text) {
    return { type: 'ADD_TODO', payload: text };
  }
};

function todoReducer(state = { todos: [] }, action) {
  return action.type === 'ADD_TODO'
    ? { ...state, todos: [...state.todos, action.payload] }
    : state;
}

describe('createConnector()', () => {
  jsdom();

  it('creates a Connector-like component using RxJS sequences', () => {
    const store = createStore(combineReducers({ todos: todoReducer }));

    // External source
    const increment$ = funcSubject();

    const TodoConnector = createConnector((props$, state$, dispatch$) => {
      const actionCreators$ = bindActionCreators(actionCreators, dispatch$);
      const selectedState$ = state$.map(s => s.todos);
      const count$ = increment$.startWith(0).scan(t => t + 1);

      return combineLatest(
        props$, selectedState$, actionCreators$, count$,
        (props, selectedState, { addTodo }, count) => ({
          ...props,
          ...selectedState,
          addTodo,
          count
        }));
    }, props => <div {...props} />);

    const tree = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <TodoConnector />
      </Provider>
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
    expect(div.props.todos).to.deep.equal([]);
    div.props.addTodo('Use Redux');
    expect(div.props.todos).to.deep.equal([ 'Use Redux' ]);
    div.props.addTodo('Use RxJS');
    expect(div.props.todos).to.deep.equal([ 'Use Redux', 'Use RxJS' ]);
    increment$();
    increment$();
    increment$();
    expect(div.props.count).to.equal(3);
  });
});
