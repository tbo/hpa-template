import { AsyncLocalStorage } from 'async_hooks';
import { FastifyReply, FastifyRequest } from 'fastify';

export const asyncLocalStorage = new AsyncLocalStorage();

interface ContextRequest extends FastifyRequest {
  query: Record<string, string | undefined>;
}

interface Context {
  request: ContextRequest;
  reply: FastifyReply;
}

export const getRequest = () => (asyncLocalStorage.getStore() as Context).request;

export const getReply = () => (asyncLocalStorage.getStore() as Context).reply;
