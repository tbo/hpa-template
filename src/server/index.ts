import { readdirSync } from 'fs';
import { join } from 'path';

const PAGES_PATH = './pages/';

readdirSync(join(__dirname, PAGES_PATH))
  .filter(filename => filename !== 'shared')
  .forEach(filename => require('./pages/' + filename));
