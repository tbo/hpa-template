import { html } from '../../utilities/template';
import getCategoryLink from '../category';

const Header = () => html`
  <header>
    <h1>HPA Template</h1>
      <nav style="background: lightgrey; padding: 5px">
        <a href="/">Counter Example</a>
        |
        <a href="${getCategoryLink({ id: '123' })}">Category Example</a>
      </nav>
    </div>
  </header>
`;

export default Header;
