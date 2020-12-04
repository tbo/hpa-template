import cache from '../../utilities/cache';
import { html } from '../../utilities/template';

const Footer = () => html`
  <footer>
    <hr />
    HPA Template 2020
  </footer>
`;

// Cache forever
export default cache(Footer);
