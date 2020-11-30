import fastify, { RouteOptions, RouteHandlerMethod } from 'fastify';
import cookie from 'fastify-cookie';
import multipart from 'fastify-multipart';
import fastifyErrorPage from 'fastify-error-page';
import { Template, renderToString } from './template';
import { asyncLocalStorage } from './context';

const app = fastify({ logger: true });

app.register(fastifyErrorPage).register(cookie).register(multipart, { addToBody: true }).listen(3000);

interface PageOptions extends Omit<RouteOptions, 'method' | 'handler'> {
  method?: RouteOptions['method'];
  handler: () => Template | Promise<Template>;
}

const getLink = (url: string) => (params?: Record<string, string | number>) => {
  if (!params) {
    return url;
  }
  return Object.entries(params).reduce((prev, [key, value]) => prev.replace(`:${key}`, String(value)), url);
};

export const addPage = (options: PageOptions) => {
  const handler: RouteHandlerMethod = (request, reply) => {
    reply.header('content-type', 'text/html');
    asyncLocalStorage.run({ request, reply }, async () => reply.send(await renderToString(options.handler())));
  };
  app.route({ method: 'GET', ...options, handler });
  return getLink(options.url);
};

interface EndpointOptions extends Omit<RouteOptions, 'method'> {
  method?: RouteOptions['method'];
}

export const addEndpoint = (options: EndpointOptions) => {
  app.route({ method: 'GET', ...options });
  return getLink(options.url);
};
