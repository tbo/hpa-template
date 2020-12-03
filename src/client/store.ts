import './hybrid';
import { action, makeObservable, observable } from 'mobx';

class Store {
  @observable
  counter = 0;
  id = Math.random();
  constructor() {
    makeObservable(this);
  }

  @action
  increment() {
    console.log('incrementing');
    this.counter += 1;
  }

  @action
  decrement() {
    console.log('decrementing');
    this.counter -= 1;
  }
}

const store = new Store();

export default store;
