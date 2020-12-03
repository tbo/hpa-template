import { autorun } from 'mobx';
import store from '../store';

class Counter extends HTMLElement {
  private root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    autorun(() => this.update());
  }

  update() {
    this.root.innerHTML = `Count: ${store.count}`;
  }
}

window.customElements.define('hpa-counter', Counter);
