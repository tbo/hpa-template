import store from '../store';

class Increment extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('click', () => store.increment());
  }
}

window.customElements.define('hpa-increment', Increment, { extends: 'button' });
