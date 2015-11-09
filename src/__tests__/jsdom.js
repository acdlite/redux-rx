import ExecutionEnvironment from 'fbjs/lib/ExecutionEnvironment';
import jsdom from 'mocha-jsdom';

export default function jsdomReact() {
  jsdom();
  ExecutionEnvironment.canUseDOM = true;
}
