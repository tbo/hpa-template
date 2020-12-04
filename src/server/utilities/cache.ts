import NodeCache from 'node-cache';
import { resolve, Template } from './template';

type CacheKeyFunction<TFn> = TFn extends (...a: infer A) => any ? (...a: A) => false | string : never;

type CacheResult = Template;

interface Options<T> extends Omit<NodeCache.Options, 'useClones'> {
  cacheKey?: CacheKeyFunction<T>;
}

/**
 * Caches component responses in an optimized format
 */
export default function cache<T extends (...args: any[]) => Template>(
  func: T,
  options: Options<T> = {},
): (...funcArgs: Parameters<T>) => CacheResult {
  const { cacheKey, ...nodeCacheOptions } = options;
  const componentCache = new NodeCache({ ...nodeCacheOptions, useClones: false });
  return (...args: Parameters<T>): CacheResult => {
    const key = cacheKey?.(...args) ?? 'static';
    if (key) {
      if (componentCache.has(key)) {
        return componentCache.get(key);
      } else {
        const result = func(...args);
        setImmediate(() => {
          const webComponents = [];
          const compiledString = resolve(result, webComponents);
          const compiledTemplate = new Template(webComponents);
          compiledTemplate[0] = compiledString;
          componentCache.set(key, compiledTemplate);
        });
        return result;
      }
    }
    return func(...args);
  };
}
