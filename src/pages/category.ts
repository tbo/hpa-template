import { html } from '../utilities/template';
import { addPage } from '../utilities/router';
import Base from './shared/base';

const Category = () => Base({ title: 'Category' }, html`<h1>Hello category</h1>`);

export default addPage({ url: '/category', handler: Category });
