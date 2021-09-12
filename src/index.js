import { init, ready } from './module/hooks.js';

// register hooks
Hooks.once('init', init);
Hooks.once('ready', ready);
