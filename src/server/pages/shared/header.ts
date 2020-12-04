import cache from '../../utilities/cache';
import { getRequest } from '../../utilities/context';
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

// Use request url as cache key
const cacheKey = () => getRequest().url;

export default cache(Header, { cacheKey, stdTTL: 600 });
