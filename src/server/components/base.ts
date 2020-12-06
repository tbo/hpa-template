import { html, Child, unsafeHtml } from '../utilities/template';
import Header from './header';
import Footer from './footer';
import getAssetUrl from '../utilities/get-asset-url';
import { isDevelopment } from '..';

const coreUrl = getAssetUrl('core.js');
const stylesUrl = getAssetUrl('styles.css');

const liveReload =
  isDevelopment && unsafeHtml('<script src="http://localhost:35729/livereload.js?snipver=1"></script>');

const Base = (props: { title: string }, ...children: Child[]) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${props.title}</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="${stylesUrl}" rel="stylesheet" />
    </head>
    <body>
      ${Header()}
      <main>
        ${children}
      </main>
      ${Footer()}
      <script src="${coreUrl}"></script>
      ${liveReload}
    </body>
  </html>
`;

export default Base;
