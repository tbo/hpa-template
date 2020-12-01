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

export const addEndpoint = (options: EndpointOptions) => {
  app.route({ method: 'GET', ...options });
  return getLink(options.url);
};

const filenameToUrl = {};
const urlToFile = {};

app.route({
  method: 'GET',
  url: '/assets/*',
  handler: (request, reply) => {
    const path = urlToFile[request.params['*']];
    if (path) {
      reply.sendFile(path, '/');
    } else {
      reply.status(404).send();
    }
  },
});

export const addAsset = (filename: string) => {
  if (filenameToUrl[filename]) {
    return filenameToUrl[filename];
  }
  const originFolder = path.dirname(callsite()[1].getFileName());
  const absoluteFilepath = path.join(originFolder, filename);
  const fileData = readFileSync(absoluteFilepath, 'utf8');
  const hash = createHash('sha1').update(fileData, 'utf8').digest('hex');
  const assetPath = `${hash}/${path.basename(filename)}`;
  const url = `/assets/${assetPath}`;
  urlToFile[assetPath] = absoluteFilepath;
  filenameToUrl[filename] = url;
  if (path.extname(filename) === '.js') {
    urlToFile[assetPath + '.map'] = absoluteFilepath + '.map';
  }
  return url;
};
