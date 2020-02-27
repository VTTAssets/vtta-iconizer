import utils from './utils.js';
import SettingsExtender from './settingsExtender.js';
SettingsExtender();

/**
 * Module initialisation, game settings registering
 */
export function init() {
  utils.log('Init'); //console.log('Iconizer | Init');
  let debug = false;
  if (!CONFIG.debug.vtta) {
    CONFIG.debug.vtta = { iconizer: debug };
  } else {
    CONFIG.debug.vtta.iconizer = debug;
  }

  game.settings.register('vtta-iconizer', 'replacement-policy', {
    name: 'vtta-iconizer.replacement-policy.name',
    hint: 'vtta-iconizer.replacement-policy.hint',
    scope: 'world',
    config: true,
    type: Number,
    default: 0,
    choices: [
      'vtta-iconizer.replacement-policy.0',
      'vtta-iconizer.replacement-policy.1',
      'vtta-iconizer.replacement-policy.2',
    ],
  });

  game.settings.register('vtta-iconizer', 'icon-database-policy', {
    name: 'vtta-iconizer.icon-database-policy.name',
    hint: 'vtta-iconizer.icon-database-policy.hint',
    scope: 'world',
    config: true,
    type: Number,
    default: 0,
    choices: [
      'vtta-iconizer.icon-database-policy.0',
      'vtta-iconizer.icon-database-policy.1',
      'vtta-iconizer.icon-database-policy.2',
    ],
  });

  game.settings.register('vtta-iconizer', 'icon-directory', {
    name: 'vtta-iconizer.icon-directory.name',
    hint: 'vtta-iconizer.icon-directory.hint',
    scope: 'world',
    config: true,
    type: Azzu.SettingsTypes.DirectoryPicker, // String,
    default: 'iconizer',
  });
}

/**
 * Loading the icon database and registering the item-hooks to adjust the icon image accordingly
 */
export async function ready() {
  let iconData = new Map();
  let iconDatabasePolicy = game.settings.get('vtta-iconizer', 'icon-database-policy');

  // load the icon database
  if (iconDatabasePolicy === 0 || iconDatabasePolicy === 1) {
    let path = '/modules/vtta-iconizer/data/icons.json';
    let fileExists = await utils.serverFileExists(path);
    if (fileExists) {
      let response = await fetch(path, { method: 'GET' });
      let json = await response.json();
      json.forEach(data => {
        iconData.set(data.name.toLowerCase(), data.icon);
      });
    }
  }

  // load the custom icon database (if there is any)
  if (iconDatabasePolicy === 1 || iconDatabasePolicy === 2) {
    let path = `/${game.settings.get('vtta-iconizer', 'icon-directory')}/icons.json`;
    let fileExists = await utils.serverFileExists(path);
    if (fileExists) {
      let response = await fetch(path, { method: 'GET' });
      let json = await response.json();
      json.forEach(data => {
        iconData.set(data.name.toLowerCase(), data.icon);
      });
    }
  }

  /**
   * Replaces the icon if the name changed and if the game settings allow that
   */
  let replaceIcon = options => {
    // if there is no name change here, just continue
    if (!options || !options.name) return options;

    const REPLACEMENT_POLICY_REPLACE_ALL = 0;
    const REPLACEMENT_POLICY_REPLACE_DEFAULT = 1;
    const REPLACEMENT_POLICY_REPLACE_NONE = 2;

    let replacementPolicy = game.settings.get('vtta-iconizer', 'replacement-policy');

    // stop right here if we should not replace anything
    if (replacementPolicy === REPLACEMENT_POLICY_REPLACE_NONE) return;

    if (
      replacementPolicy === REPLACEMENT_POLICY_REPLACE_ALL ||
      (replacementPolicy === REPLACEMENT_POLICY_REPLACE_DEFAULT &&
        (!options.img || options.img.toLowerCase().indexOf('mystery-man') !== -1))
    ) {
      utils.log('Pre-processing');
      utils.log(options);
      let name = options.name
        .toLowerCase()
        .replace(/\([^)]*\)/g, '')
        .trim();
      let newIcon = iconData.get(name);

      if (newIcon !== undefined) {
        let directory = game.settings.get('vtta-iconizer', 'icon-directory');
        options.img = directory + '/' + newIcon;
      } else {
        if (replacementPolicy === 0) {
          options.img = 'icons/svg/mystery-man.svg';
        }
      }
      utils.log('Post-processing');
      utils.log(options);
    } else {
      utils.log('Not replacing icon');
    }

    return options;
  };

  // Hook on the item create events to replace the icon
  Hooks.on('preCreateItem', (createData, options) => {
    options = replaceIcon(options);
  });

  Hooks.on('preCreateOwnedItem', (parent, createData, options) => {
    if (!options.img) {
      let item = parent.getEmbeddedEntity('OwnedItem', options._id);
      if (item) {
        options.img = parent.img;
      }
    }

    options = replaceIcon(options);
  });

  Hooks.on('preUpdateItem', (createData, options) => {
    utils.log('preUpdateItem');
    if (!options.img) {
      options.img = createData.img;
    }
    options = replaceIcon(options);
  });

  Hooks.on('preUpdateOwnedItem', (parent, createData, options) => {
    utils.log('preUpdateOwnedItem');
    if (!options.img) {
      let item = parent.getEmbeddedEntity('OwnedItem', options._id);
      if (item) {
        options.img = item.img;
      }
    }
    options = replaceIcon(options);
  });

  document.addEventListener('queryIcon', event => {
    if (event.detail && event.detail.name) {
      let response = replaceIcon({ name: event.detail.name });
      document.dispatchEvent(new CustomEvent('deliverIcon', response));
      utils.log('queryIcon');
      utils.log(response);
    }
  });

  document.addEventListener('queryIcons', event => {
    if (event.detail && event.detail.names && Array.isArray(event.detail.names)) {
      let response = [];
      for (let name of event.detail.names) {
        response.push(replaceIcon(name));
      }
      utils.log('queryIcons');
      utils.log(response);
      document.dispatchEvent(new CustomEvent('deliverIcon', { detail: response }));
    }
  });
}
