import { TextEncoder as TE, TextDecoder as TD } from 'util';
global.TextEncoder = TE;
global.TextDecoder = TD as any;
global.fetch = require("jest-fetch-mock");
