import { html } from '../utilities/template';
import { addPage } from '../utilities/router';
import Base from '../components/base';

const Category = () => Base({ title: 'Category' }, html`<h1>Category Example</h1>`);

export default addPage({ url: '/category', handler: Category });
