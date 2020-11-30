import fastify, { RouteHandlerMethod, RouteOptions } from 'fastify';
import cookie from 'fastify-cookie';
import fastifyErrorPage from 'fastify-error-page';
import multipart from 'fastify-multipart';
import fastifyStatic from 'fastify-static';
import path from 'path';
import { asyncLocalStorage } from './context';
import { renderToString, Template } from './template';
import callsite from 'callsite';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

const app = fastify({ logger: true });

app
  .register(fastifyErrorPage)
  .register(cookie)
  .register(multipart, { addToBody: true })
  .register(fastifyStatic, {
    root: path.join(__dirname, '../../public'),
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

export const addAsset = function (filename: string) {
  const originFolder = path.dirname(callsite()[1].getFileName());
  const root = process.cwd();
  const absoluteFilepath = path.join(originFolder, filename);
  const relativeFilepath = path.relative(root, absoluteFilepath);
  const fileData = readFileSync(absoluteFilepath, 'utf8');
  const hash = createHash('sha1').update(fileData, 'utf8').digest('hex');
  const url = `/assets/${hash}/${path.basename(filename)}`;
  app.route({
    method: 'GET',
    url,
    handler: (_request, reply) => {
      reply.sendFile(relativeFilepath, root);
    },
  });
  return url;
};

export const addEndpoint = (options: EndpointOptions) => {
  app.route({ method: 'GET', ...options });
  return getLink(options.url);
};
