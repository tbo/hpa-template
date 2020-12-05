import http2, { ClientHttp2Session } from 'http2';

interface Options {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'HEAD' | 'DELETE';
  headers?: Record<string, string>;
}

const connect = <T = unknown>(host: string) => {
  let client: ClientHttp2Session;
  return ({ path, method, headers }: Options): Promise<T> => {
    if (!client || client.closed) {
      client = http2.connect(host);
    }
    const request = client.request({ ':path': path, ':method': method ?? 'GET', ...headers });
    let buffer = '';
    request.on('data', chunk => (buffer += chunk));
    return new Promise((resolve, reject) => {
      request.on('end', () => resolve(JSON.parse(buffer)));
      request.on('error', error => reject(error));
    });
  };
};

export default connect;
