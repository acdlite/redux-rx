import { createRxComponent } from 'react-rx-component';
import { observableFromStore } from './';
import { PropTypes } from 'react';

export default function createConnector(selectState, render) {
  const Connector = createRxComponent(
    (props$, context$) => selectState(
      props$,
      context$.flatMap(
        c => observableFromStore(c.store).startWith(c.store.getState())
      ),
      context$.map(c => c.store.dispatch),
      context$
    ),
    render
  );
  Connector.displayName = 'Connector';
  Connector.contextTypes = { store: PropTypes.object };
  return Connector;
}
