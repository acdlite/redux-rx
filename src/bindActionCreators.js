import isObservable from './isObservable';
import { bindActionCreators as bac } from 'redux';

export default function bindActionCreators(actionCreators, $dispatch) {
  return isObservable($dispatch)
    ? $dispatch.map(dispatch => bac(actionCreators, dispatch))
    : bac(actionCreators, $dispatch);
}
