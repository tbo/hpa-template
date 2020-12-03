import { autorun } from 'mobx';
import store from '../store';

class Counter extends HTMLElement {
  constructor() {
    super();
    autorun(this.update);
  }

  update() {
    console.log('ID:', store.id, 'Counter:', store.counter);
  }
}

window.customElements.define('hpa-counter', Counter);
