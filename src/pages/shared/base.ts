import { html, Child } from '../../utilities/template';
import Header from './header';
import Footer from './footer';

const Base = (props: { title: string }, ...children: Child[]) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${props.title}</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="/assets/styles.css" rel="stylesheet" />
    </head>
    <body class="">
      ${Header()}
      <main class="uk-container">
        ${children}
      </main>
      ${Footer()}
      <script src="/assets/components/client.js"></script>
    </body>
  </html>
`;

export default Base;