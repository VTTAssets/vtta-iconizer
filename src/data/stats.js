const fs = require('fs');
const path = require('path');

let files = fs.readdirSync(__dirname, 'utf-8').filter((file) => file.indexOf('.json') !== -1);

let types = {};

files.forEach((file) => {
  types = {};
  console.log(file);
  var entries = JSON.parse(fs.readFileSync(path.resolve(__dirname, file), 'utf-8'));
  for (let item of entries) {
    if (!types.hasOwnProperty(item.type)) {
      types[item.type] = 1;
    } else {
      types[item.type]++;
    }
  }
  console.log(`Dictionary ${file}: ${entries.length} items`);
  Object.keys(types)
    .sort()
    .forEach((type) => {
      console.log(`${type.padEnd(20, ' ')}: ${types[type]}`);
    });
  console.log('===================================================');
});
