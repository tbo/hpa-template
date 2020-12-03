import { html } from '../utilities/template';
import { addPage } from '../utilities/router';
import Base from './shared/base';

const HomePage = () =>
  Base(
    { title: 'Homepage' },
    html`<div>
      <h1>Hello World</h1>
      <hpa-counter></hpa-counter>
      <br />
      <button is="hpa-increment">+</button>
      <button is="hpa-decrement">-</button>
    </div>`,
  );

export default addPage({ url: '/', handler: HomePage });
