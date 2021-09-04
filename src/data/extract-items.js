const fs = require('fs');
const path = require('path');

const packDirectory = path.resolve(__dirname, '../../../systems/dnd5e/packs');
const packNames = ['items.db', 'spells.db', 'classfeatures.db', 'classes.db'];

let items = [];
for (let packName of packNames) {
  let existingEntries = items.length;
  var entries = fs
    .readFileSync(path.resolve(packDirectory, packName), 'utf-8')
    .split('\n')
    .map((line) => (line.trim() !== '' ? JSON.parse(line) : undefined))
    .filter((contents) => contents !== undefined)
    .map((json) => ({
      name: json.name,
      type: json.type,
      icon: json.img[0] !== '/' ? `/${json.img}` : json.img,
    }));

  for (let item of entries) {
    if (item.icon) {
      let filtered = items.filter(
        (i) => i.name === item.name && i.type === item.type,
        // Foundry does not know about subTypes
      );
      if (filtered.length === 0) {
        items.push(item);
      }
    }
  }
  console.log(
    `Pack ${packName}: ${entries.length} items processed successfully, added ${items.length - existingEntries} items.`,
  );
  //items = items.concat(items, entries);
}

fs.writeFileSync(path.resolve(__dirname, 'foundry-icons.json'), JSON.stringify(items));

// let icons = require("./wow-icons.json");
// icons = icons.map(icon => ({
//   name: icon.name,
//   icon: icon.icon.toLowerCase().replace(/png$/, "jpg")
// }));
// fs.writeFileSync(
//   path.resolve(__dirname, "wowhead-icons.json"),
//   JSON.stringify(icons)
// );
