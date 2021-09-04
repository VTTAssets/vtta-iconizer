const fs = require('fs');
const path = require('path');

let dbItems = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'worldofwarcraft-icons.json'), 'utf-8'));

let modItems = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'wow-icons.json'), 'utf-8'));

let added = [];
let missing = [];

let defineType = (type) => {
  switch (type) {
    case 'backpack':
    case 'class':
    case 'consumable':
    case 'equipment':
    case 'feat':
    case 'loot':
    case 'spell':
    case 'tool':
    case 'weapon':
      return type;

    case 'ammunition':
    case 'ring':
    case 'rod':
    case 'wondrous item':
      return 'loot';

    case 'scroll':
    case 'potion':
    case 'wand':
      return 'consumable';
    default:
      console.log('DEFAULT CASE FOR ' + type);
      result.push('loot');
  }
};

for (let modItem of modItems) {
  if (modItem.type === undefined) {
    console.log('Looking up ' + modItem.name);
    let filtered = dbItems.filter((item) => item.name === modItem.name);

    console.log('Found ' + filtered.length + ' results in DB');
    console.log(filtered);
    if (filtered.length > 0) {
      if (filtered.length > 1) console.log('+++');

      let items = filtered.map((item) => {
        return {
          ...modItem,
          type: defineType(item.type),
          subType: item.subType,
          icon: item.icon,
        };
      });
      console.log('Created ' + items.length + ' new items');
      console.log(items);
      added = added.concat(items);
    } else {
      missing.push(modItem);
    }
    console.log(`${modItem.name} => ${filtered.map((item) => item.type).join(', ')}`);
  } else {
    console.log(`Item ${modItem.name} has type ${modItem.type}, let's check for subtype`);
    // try adding a subType
    let dbItem = dbItems.find((i) => i.name === modItem.name);
    console.log(dbItem);
    if (dbItem) {
      modItem.subType = dbItem.subType;
    } else {
      modItem.subType = null;
    }
    added.push(modItem);
  }
}

fs.writeFileSync(__dirname + '/result.json', JSON.stringify(added));

console.log('Missing items: ');
console.log(missing);
