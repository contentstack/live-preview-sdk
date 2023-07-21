// index.js
// import { render } from 'mustache';
import {render} from 'mustache';
import { readFile, writeFileSync } from 'fs';
import packageJson from "./package.json";
const MUSTACHE_MAIN_DIR = './main.mustache';
/**
  * DATA is the object that contains all
  * the data to be provided to Mustache
  * Notice the "name" and "date" property.
*/
const DATA = {
  packageVersion: packageJson.version,
};
function generateReadMe() {
  readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const output = render(data.toString(), DATA);
    writeFileSync('README.md', output);
  });
}
generateReadMe();