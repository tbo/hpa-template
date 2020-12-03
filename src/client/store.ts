import './hybrid';
import { action, makeObservable, observable } from 'mobx';

class Store {
  @observable
  count = 0;

  constructor() {
    makeObservable(this);
  }

  @action
  increment() {
    this.count += 1;
  }

  @action
  decrement() {
    this.count -= 1;
  }
}

const store = new Store();

export default store;
