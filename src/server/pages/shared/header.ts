import { html } from '../../utilities/template';
import getCategoryLink from '../category';

const Header = () => html`
  <header>
    <h1>HPA Template</h1>
      <nav style="background: lightgrey; padding: 5px">
        <a href="/">Home</a>
        |
        <a href="${getCategoryLink({ id: '123' })}">Example Category</a>
      </nav>
    </div>
  </header>
`;

export default Header;
