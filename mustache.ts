// index.js
// import { render } from 'mustache';
import * as mustache from 'mustache';
import { readFile, writeFileSync } from 'fs';
import packageJson from "./package.json" assert { type: "json" };
const MUSTACHE_MAIN_DIR = './main.mustache';
/**
  * DATA is the object that contains all
  * the data to be provided to Mustache
  * Notice the "name" and "date" property.
*/
const DATA = {
  packageVersion: packageJson.version,
  currentYear: new Date().getFullYear(),
};
function generateReadMe() {
  
  readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const output = mustache.default.render(data.toString(), DATA);
    writeFileSync('README.md', output);
  });
}
generateReadMe();