import utils from "./utils.js";

/**
 * Module initialisation, game settings registering
 */
export function init() {
  utils.log("Init");
  let debug = false;
  if (!CONFIG.debug.vtta) {
    CONFIG.debug.vtta = { iconizer: debug };
  } else {
    CONFIG.debug.vtta.iconizer = debug;
  }

  game.settings.register("vtta-iconizer", "replacement-policy", {
    name: "vtta-iconizer.replacement-policy.name",
    hint: "vtta-iconizer.replacement-policy.hint",
    scope: "world",
    config: true,
    type: Number,
    default: 0,
    choices: [
      "vtta-iconizer.replacement-policy.0",
      "vtta-iconizer.replacement-policy.1",
      "vtta-iconizer.replacement-policy.2",
    ],
  });

  game.settings.register("vtta-iconizer", "icon-database-policy", {
    name: "vtta-iconizer.icon-database-policy.name",
    hint: "vtta-iconizer.icon-database-policy.hint",
    scope: "world",
    config: true,
    type: Number,
    default: 0,
    choices: [
      "vtta-iconizer.icon-database-policy.0",
      "vtta-iconizer.icon-database-policy.1",
      "vtta-iconizer.icon-database-policy.2",
    ],
  });

  game.settings.register("vtta-iconizer", "base-dictionary", {
    name: "vtta-iconizer.base-dictionary.name",
    hint: "vtta-iconizer.base-dictionary.hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "foundry-icons.json": "Foundry Icons",
      "wow-icons.json": "World of Warcraft icons (offline, local icons)",
      "wowhead-icons.json": "World of Warcraft icons (online, wowhead.com)",
    },
    default: "foundry-icons.json",
  });

  // Relabeling "icon directory" to "icon prefix" setting
  game.settings.register("vtta-iconizer", "icon-directory", {
    name: "vtta-iconizer.icon-prefix.name",
    hint: "vtta-iconizer.icon-prefix.hint",
    scope: "world",
    config: true,
    type: String,
    default: "iconizer",
  });

  // Submitting icons is a todo
  // game.settings.register("vtta-iconizer", "share-missing-icons", {
  //   name: "vtta-iconizer.share-missing-icons.name",
  //   hint: "vtta-iconizer.share-missing-icons.hint",
  //   scope: "world",
  //   config: true,
  //   type: Boolean,
  //   default: false,
  // });
}

/**
 * Loading the icon database and registering the item-hooks to adjust the icon image accordingly
 */
export async function ready() {
  // check for failed registered settings
  let hasErrors = false;

  for (let s of game.settings.settings.values()) {
    if (s.module !== "vtta-iconizer") continue;
    try {
      game.settings.get(s.module, s.key);
    } catch (err) {
      hasErrors = true;
      ui.notifications.info(`[${s.module}] Erroneous module settings found, resetting to default.`);
      game.settings.set(s.module, s.key, s.default);
    }
  }

  if (hasErrors) {
    ui.notifications.warn("Please review the module settings to re-adjust them to your desired configuration.");
  }

  let iconData = new Map();
  let iconDatabasePolicy = game.settings.get("vtta-iconizer", "icon-database-policy");

  // load the base dictionary
  if (iconDatabasePolicy === 0 || iconDatabasePolicy === 1) {
    const basePath = ROUTE_PREFIX ? `/${ROUTE_PREFIX}` : "";
    const path = `${basePath}/modules/vtta-iconizer/data/${game.settings.get("vtta-iconizer", "base-dictionary")}`;

    const fileExists = await utils.serverFileExists(path);
    if (fileExists) {
      let response = await fetch(path, { method: "GET" });

      let json = await response.json();
      json.forEach(data => {
        iconData.set(data.name.toLowerCase(), data.icon);
      });
    }
  }

  // load the custom icon database (if there is any)
  if (iconDatabasePolicy === 1 || iconDatabasePolicy === 2) {
    const prefix = game.settings.get("vtta-iconizer", "icon-directory");
    console.log("Prefix is: " + prefix);
    if (prefix.indexOf("http") === 0) {
      console.log("starting with http");
      let path = `${game.settings.get("vtta-iconizer", "icon-directory")}/icons.json`;
      try {
        let response = await fetch(path, { method: "GET" });
        let json = await response.json();
        json.forEach(data => {
          iconData.set(data.name.toLowerCase(), data.icon);
        });
      } catch (error) {
        console.log(error);
        console.log("Error loading custom dictionary from " + path);
      }
    } else {
      let path = `/${game.settings.get("vtta-iconizer", "icon-directory")}/icons.json`;
      let fileExists = await utils.serverFileExists(path);
      if (fileExists) {
        let response = await fetch(path, { method: "GET" });
        let json = await response.json();
        json.forEach(data => {
          iconData.set(data.name.toLowerCase(), data.icon);
        });
      }
    }
  }

  /**
   * Replaces the icon if the name changed and if the game settings allow that
   */
  let replaceIcon = options => {
    utils.log(options);
    // if there is no name change here, just continue
    if (!options || !options.name) return options;

    const REPLACEMENT_POLICY_REPLACE_ALL = 0;
    const REPLACEMENT_POLICY_REPLACE_DEFAULT = 1;
    const REPLACEMENT_POLICY_REPLACE_NONE = 2;

    let replacementPolicy = game.settings.get("vtta-iconizer", "replacement-policy");

    // stop right here if we should not replace anything
    if (replacementPolicy === REPLACEMENT_POLICY_REPLACE_NONE) return;

    if (
      replacementPolicy === REPLACEMENT_POLICY_REPLACE_ALL ||
      (replacementPolicy === REPLACEMENT_POLICY_REPLACE_DEFAULT &&
        (!options.img || options.img.toLowerCase().indexOf("mystery-man") !== -1))
    ) {
      let name = options.name
        .toLowerCase()
        .replace(/\([^)]*\)/g, "")
        .trim();
      let newIcon = iconData.get(name);

      if (newIcon !== undefined) {
        // accept absolute references to icons and do not prefix with the icon directory
        if (newIcon.startsWith("/") || newIcon.indexOf("://") === 0 || newIcon.indexOf("http") === 0) {
          options.img = newIcon;
        } else {
          // online references by wowhead-icons.json
          let baseDictionary = game.settings.get("vtta-iconizer", "base-dictionary");
          if (baseDictionary === "wowhead-icons.json") {
            options.img = "https://wow.zamimg.com/images/wow/icons/large" + "/" + newIcon;
          } else {
            options.img = game.settings.get("vtta-iconizer", "icon-directory") + "/" + newIcon;
          }
        }
      } else {
        if (replacementPolicy === 0) {
          //options.img = "icons/svg/mystery-man.svg";
        }
      }
      utils.log("Post-processing");
      utils.log(options);
    } else {
      utils.log("Not replacing icon");
    }

    return options;
  };

  // Hook on the item create events to replace the icon
  Hooks.on("preCreateItem", (createData, options, userId) => {
    console.log("preCreateItem");
    let opts = {
      name: createData.name,
      img: createData.img
    }
    opts = replaceIcon(opts);

    createData.data._source.img = opts.img
  });

  Hooks.on("preUpdateItem", (entity, updateData, options, userId) => {
    //Hooks.on("preUpdateItem", (createData, options) => {
    utils.log("preUpdateItem");
    if (!updateData.img) {
      updateData.img = entity.img;
    }
    updateData = replaceIcon(updateData);
  });

  Hooks.on("preCreateOwnedItem", (createData, options, userId) => {
    //Hooks.on("preCreateOwnedItem", (parent, createData, options) => {
    options = replaceIcon(options);
    console.log("+++++++++++++++++++++++++++++++++++++++");
    console.log("preCreateOwnedItem almost finished, let's check if that item came from a Foundry import:");
    console.log(options);

    // console.log("Options.flags?" + options.flags);
    // if (
    //   options.flags &&
    //   options.flags.vtta &&
    //   options.flags.vtta.dndbeyond &&
    //   options.flags.vtta.dndbeyond.type &&
    //   (options.img === undefined ||
    //     options.img.toLowerCase() === "icons/svg/mystery-man.svg")
    // ) {
    //   submitItem(options.name, options.type, options.flags.vtta.dndbeyond.type);
    // }
    console.log("preCreateOwnedItem finshed");
  });

  Hooks.on("preUpdateOwnedItem", (entity, updateData, options, userId) => {
    //Hooks.on("preUpdateOwnedItem", (parent, createData, options) => {
    utils.log("preUpdateOwnedItem");
    if (!options.img) {
      let item = entity.getEmbeddedEntity("OwnedItem", options._id);
      if (item) {
        options.img = item.img;
      }
    }
    options = replaceIcon(options);
  });

  document.addEventListener("queryIcon", event => {
    if (event.detail && event.detail.name) {
      let response = replaceIcon({ name: event.detail.name });
      document.dispatchEvent(new CustomEvent("deliverIcon", response));
      utils.log("queryIcon");
      utils.log(response);
    }
  });

  document.addEventListener("queryIcons", event => {
    if (event.detail && event.detail.names && Array.isArray(event.detail.names)) {
      let response = [];
      for (let name of event.detail.names) {
        let result = replaceIcon(name);
        response.push(replaceIcon(name));
      }

      document.dispatchEvent(new CustomEvent("deliverIcon", { detail: response }));
    }
  });
}
