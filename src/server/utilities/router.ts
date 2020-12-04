import fastify, { RouteHandlerMethod, RouteOptions } from 'fastify';
import cookie from 'fastify-cookie';
import fastifyErrorPage from 'fastify-error-page';
import multipart from 'fastify-multipart';
import fastifyStatic from 'fastify-static';
import path from 'path';
import { asyncLocalStorage } from './context';
import { renderToString, Template } from './template';

const app = fastify({ logger: true });

app
  .register(fastifyErrorPage)
  .register(cookie)
  .register(multipart, { addToBody: true })
  .register(fastifyStatic, {
    prefix: '/assets/',
    root: path.join(__dirname, '../../../build'),
  })
  .listen(3000);

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
  const handler: RouteHandlerMethod = async (request, reply) => {
    reply.header('content-type', 'text/html');
    await asyncLocalStorage.run({ request, reply }, async () => {
      reply.send(await renderToString(options.handler()));
    });
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
