import { html, Child } from '../../utilities/template';
import Header from './header';
import Footer from './footer';
import getAssetUrl from '../../utilities/get-asset-url';

const clientUrl = getAssetUrl('client.js');
const stylesUrl = getAssetUrl('styles.css');

const Base = (props: { title: string }, ...children: Child[]) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${props.title}</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="${stylesUrl}" rel="stylesheet" />
    </head>
    <body is="hpa-store">
      ${Header()}
      <main>
        ${children}
      </main>
      ${Footer()}
      <script src="${clientUrl}"></script>
    </body>
  </html>
`;

export default Base;
