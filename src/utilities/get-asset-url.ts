import { readdirSync } from 'fs';
import path from 'path';

const assets = Object.fromEntries(
  readdirSync(path.resolve(__dirname, '../../build')).map(filename => [
    filename.split(/-(.+)/)[1],
    `/assets/${filename}`,
  ]),
);

export default (name: string) => assets[name];
