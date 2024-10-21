// index.js
// import { render } from 'mustache';
import * as mustache from 'mustache';
import { readFile, readFileSync, writeFileSync } from 'fs';
import packageJson from "./package.json" assert { type: "json" };
import ssri from 'ssri';
const MUSTACHE_MAIN_DIR = './main.mustache';
const fileContent = readFileSync('./dist/modern/index.js'); 
const integrity = ssri.fromData(fileContent, { algorithms: ['sha384'] }); 
/**
  * DATA is the object that contains all
  * the data to be provided to Mustache
  * Notice the "name" and "date" property.
*/
const DATA = {
  packageVersion: packageJson.version,
  integrity: integrity.toString(),
};
function generateReadMe() {
  
  readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const output = mustache.default.render(data.toString(), DATA);
    writeFileSync('README.md', output);
  });
}
generateReadMe();