import morphdom from 'morphdom';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const isLocalLink = (node: Node): boolean => {
  let linkNode = node;
  while (linkNode && linkNode.nodeName !== 'A') {
    linkNode = linkNode.parentNode as Node;
  }
  return linkNode && !~((linkNode as HTMLAnchorElement).getAttribute?.('href') ?? '').indexOf('://');
};

const isTextInput = (node: Node): node is HTMLInputElement =>
  node.nodeName === 'INPUT' && ['email', 'text', 'password'].includes((node as HTMLInputElement).type);

let cache: Cache;
window.caches.open('hybrid').then(c => (cache = c));

const shouldUpdateFromNetwork = (from: Node, to: Node) => {
  if (
    from === document.activeElement &&
    isTextInput(from) &&
    isTextInput(to) &&
    from.value !== from.getAttribute('value')
  ) {
    return false;
  }
  return !from.isEqualNode(to);
};

const shouldUpdateFromCache = (from: Node, to: Node) => {
  if (
    (from === document.activeElement &&
      isTextInput(from) &&
      isTextInput(to) &&
      from.value !== from.getAttribute('value')) ||
    (from as any).getAttribute('data-lazy') !== null
  ) {
    return false;
  }
  return !from.isEqualNode(to);
};

let abortController: AbortController | null = null;

const parser = new DOMParser();

const getFirstValidResponse = <T>(requests: Promise<T>[]): Promise<T> =>
  new Promise(resolve => requests.forEach(request => request.then(result => result && resolve(result))));

const transformDom = (mode: 'cache' | 'network') => (text: string) => {
  const start = performance.now();
  const newDom = parser.parseFromString(text, 'text/html');
  morphdom(document.documentElement, newDom.documentElement, {
    onBeforeElUpdated: mode === 'network' ? shouldUpdateFromNetwork : shouldUpdateFromCache,
  });
  // Embedded JavaScript needs to be evaluated explicitly
  document.querySelectorAll('script').forEach(({ innerHTML: innerText }) => {
    if (innerText) {
      eval(innerText);
    }
  });
  window.document.dispatchEvent(
    new Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true,
    }),
  );
  const end = performance.now();
  console.info('Transition took', end - start);
};

const restoreScrollPosition = () => {
  const position = window.history.state?.scrollPosition;
  if (position) {
    window.scrollTo(...position);
  }
};

const handleRespone = (request: Request, mode: 'cache' | 'network', cacheRace: AbortController) => async (
  response: Response | undefined,
) => {
  if (!response) {
    return;
  }
  // The cache can be slower, than the network in some rare cases. We abort the
  // rendering of cached responses in those situations to avoid overriding
  // up-to-date responses with stale data.
  if (cacheRace.signal.aborted) {
    return;
  }
  if (response.headers.get('content-type')?.indexOf('text/html') === -1) {
    abortController?.abort();
    window.location.href = response.url;
    return;
  }
  await response.clone().text().then(transformDom(mode)).then(restoreScrollPosition);
  if (mode === 'network') {
    // Aborting requests of cached responses will lead to uncaught exceptions
    abortController = null;
    cache.put(response.url, response);
    if (response.status === 301) {
      cache.put(request.url, response);
    }
    cacheRace.abort();
    window.document.dispatchEvent(
      new Event('new-content', {
        bubbles: true,
        cancelable: true,
      }),
    );
  }
  return response.url;
};

const handleTransition = (targetUrl: string, body?: BodyInit) => {
  abortController?.abort();
  abortController = new AbortController();
  const cacheRace = new AbortController();
  document.body.classList.add('is-loading');
  const request = new Request(targetUrl, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    redirect: 'follow',
    signal: abortController.signal,
    body,
  });
  const cachedTransition = cache?.match(request).then(handleRespone(request, 'cache', cacheRace));
  const networkTransition = fetch(request)
    .then(handleRespone(request, 'network', cacheRace))
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error(error, `Unable to resolve "${targetUrl}". Doing hard load instead...`);
        window.location.href = targetUrl;
      }
    });
  return getFirstValidResponse([cachedTransition, networkTransition]);
};

const navigateTo = async (targetUrl: string, body?: BodyInit) => {
  window.history.replaceState({ scrollPosition: [window.scrollX, window.scrollY] }, document.title);
  // The final and target URLs can differ due to HTTP redirects.
  const finalUrl = await handleTransition(targetUrl, body);
  if (finalUrl) {
    if (finalUrl !== window.location.href) {
      window.history.pushState(null, document.title, finalUrl);
    }
    window.scrollTo(0, 0);
  }
};

const handleClick = (event: MouseEvent) => {
  const element = (event.composedPath() as HTMLAnchorElement[]).find(target => target.nodeName === 'A');
  if (element && isLocalLink(element)) {
    event.preventDefault();
    navigateTo(element.getAttribute('href') ?? '');
  }
};

const handleSubmit = (event: Event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = new FormData(form);
  if (form.method === 'post') {
    navigateTo(form.action, data);
  } else {
    const query = new URLSearchParams(data as any).toString();
    navigateTo(form.action + (query ? '?' + query : ''));
  }
};

document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  window.onpopstate = (event: PopStateEvent) => handleTransition((event?.target as Window).location.href);
});
