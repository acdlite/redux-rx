import { createRxComponent } from 'react-rx-component';
import { observableFromStore } from './';
import { PropTypes } from 'react';

export default function createConnector(selectState, render) {
  const Connector = createRxComponent(
    (props$, context$) => selectState(
      props$,
      context$.flatMap(
        c => observableFromStore(c.redux).startWith(c.redux.getState())
      ),
      context$.map(c => c.redux.dispatch)
    ),
    render
  );
  Connector.displayName = 'Connector';
  Connector.contextTypes = { redux: PropTypes.object };
  return Connector;
}
