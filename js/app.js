import { checkDevice } from './security.js';

if (!checkDevice()) {
  await import('./main.js');
}