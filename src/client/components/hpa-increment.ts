import { autorun } from 'mobx';
import store from '../store';

class Increment extends HTMLButtonElement {
  constructor() {
    super();
    autorun(this.update);
  }

  connectedCallback() {
    this.addEventListener('click', () => store.increment());
  }

  update() {
    console.log('ID:', store.id, 'something changed:', store.counter);
  }
}

window.customElements.define('hpa-increment', Increment, { extends: 'button' });
