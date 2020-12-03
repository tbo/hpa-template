import { readdirSync } from 'fs';
import path from 'path';

const assets = Object.fromEntries(
  readdirSync(path.resolve(__dirname, '../../../build')).map(filename => [
    process.env.NODE_ENV === 'production' ? filename.split(/-(.+)/)[1] : filename,
    `/assets/${filename}`,
  ]),
);

export default (name: string) => assets[name];
