import getAssetUrl from './get-asset-url';

const repeatedWhitespace = /\s{2,}/g;
const whitespace = /\r\n|\n|\r|(\s{1,}(?=<))/g;

const htmlEscape = (value: any) =>
  typeof value !== 'string' || (value as any) instanceof UnsafeHtml
    ? value
    : value
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');

const cache = new Map();

export type Child = string | number | undefined | null | Promise<TemplateElement> | Template | UnsafeHtml;

export type TemplateElement = Child | Child[];

export class Template extends Array {
  public webComponents: string[];

  constructor(webComponents?: string[]) {
    super();
    this.webComponents = webComponents || [];
  }
}

class UnsafeHtml extends String {}

export const unsafeHtml = (value: string) => new UnsafeHtml(value);

const WEB_COMPONENT_PATTERN = /(?:<| is=")([a-zA-Z]+-[a-zA-Z-]+)/g;

export const html = (literalSections: TemplateStringsArray, ...substs: TemplateElement[]) => {
  let [raw, webComponents] = cache.get(literalSections) || [];
  if (!raw) {
    raw = literalSections.raw.map((item: string) => item.replace(whitespace, '').replace(repeatedWhitespace, ' '));
    webComponents = new Set(Array.from(raw.join().matchAll(WEB_COMPONENT_PATTERN)).map((hit: any) => hit[1]));
    cache.set(literalSections, [raw, webComponents]);
  }
  const result = new Template(webComponents);
  for (let i = 0; i < substs.length; i++) {
    const subst = substs[i];
    result.push(raw[i]);
    if (subst instanceof Template) {
      result.push(...subst.flat());
      result.webComponents = [...result.webComponents, ...subst.webComponents];
    } else if (Array.isArray(subst)) {
      result.push(...subst.flatMap(htmlEscape));
      subst.forEach(item => {
        if (item instanceof Template) {
          result.webComponents.push(...item.webComponents);
        }
      });
    } else {
      result.push(htmlEscape(subst));
    }
  }
  result.push(raw[raw.length - 1]);
  return result;
};

const getWebComponentScript = (name: string) => `<script src="${getAssetUrl(`${name}.js`)}"></script>`;

const resolve = async (component: Template | Promise<Template>, webComponents: string[]) => {
  const list = await component;
  if (list.webComponents) {
    webComponents.push(...list.webComponents);
  }
  let buffer = '';
  for (const item of list) {
    if (item != null && item !== false) {
      buffer += await item;
    }
  }
  return buffer;
};

export const renderToString = async (component: Template | Promise<Template>) => {
  const webComponents: string[] = [];
  const buffer = await resolve(component, webComponents);
  if (!webComponents.length) {
    return buffer;
  }
  const index = buffer.lastIndexOf('</body>');
  return buffer.slice(0, index) + webComponents.map(getWebComponentScript).join('') + buffer.slice(index);
};
