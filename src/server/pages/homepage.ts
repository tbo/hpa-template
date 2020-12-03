import { html } from '../utilities/template';
import { addPage } from '../utilities/router';
import Base from './shared/base';

const HomePage = () =>
  Base(
    { title: 'Homepage' },
    html`<div>
      <h1>Hello World</h1>
      <hpa-counter />
      <button is="hpa-increment">+</button>
    </div>`,
  );

export default addPage({ url: '/', handler: HomePage });
