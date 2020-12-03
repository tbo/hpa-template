import store from '../store';

class Decrement extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('click', () => store.decrement());
  }
}

window.customElements.define('hpa-decrement', Decrement, { extends: 'button' });
