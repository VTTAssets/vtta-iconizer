# Changelog

## [2.1.6] Hotfix 

- That's what happens if you release in a rush

## [2.1.5] Hotfix 

- Iconizer does not replace existing, manually set icons any longer with the Mystery Man when nothing is found in the dictionary that seems like a better fit when the Icon Replacement Policy is set to "Always replace"

## [2.1.4] Hotfix

- Because reading is hard

## [2.1.3] Collab is Love

Accompagnied with some backend work, I put in the extra effort to provide a hassle-free community tool for assigning suitable icons for items yet missing one: You can find it on https://www.vttassets.com/iconizer and is available for every Patron of mine - if you have some free time, check back on the website if there are new imports that need some love.

"Only for Patreons!?" you might ask? Take a deep breath: Making the tool to assign icons publicly available *could* result in a diminuished icon selection quality, and I do trust my people. The resulting icon dictionary though will be regularly included in the latest releast of iconizer, of course, and publicly available.

In order to get to know all (at least at some point) items currently available on D&D Beyond, you will have the option to submit item names that are lacking an icon to vttassets.com. Please check the Module settings to opt-in to actually submit those icons to try to get to 100% coverage - wohoo! 

Privacy policy statement: Transmitted is the item name, the item type (weapon, equipment, consumable etc.), and an icon subtype coming from the character import (e.g. "Longsword", "Class Feature") and this info is all that is saved to the database. 

Another bummer for some ppeople: Yes, this only workswith the World of Warcraft Icon set, and no, I have no plans to make that possible for other icons sets (yet? So much to do, so little time!) - sorry!

## [2.1.2] Foundry 0.5.3 compatability release

### Changed

- Set compatibleCoreVersion to 0.5.3

## [2.1.1]

### Changed

- Removed the dnd5e system requirement. While the icon database is tied to the dnd5e system/ D&D Beyond item names, the base functionality of the module can be very useful for other game systems, too. For the time being, at least one default database will always be loaded, though, so you might have some memory consumption that you can't make use of. This will probably change in a later revision of the module.

- You can now select a base dictionary to use, and you can choose from two entries in the "Module Settings": Foundry Icons or World of Warcraft icons.

  If you want to use World of Warcraft icons, you will need to provide those and put them flat into the directory set in the "Icon directory" setting.

  If you are using the icons coming with Foundry, you are good to go.

- The setting that was called "Icon directory" is now called "Icon prefix" to hint more flexibility. When Iconizer finds a reference to a filename in his dictionary, it prefixes the filename with the value found in this setting.

  For example, if you are creating a "Longbow", and iconizer has the following dictionary entry:

  ```
  {
      "name": "Longbow",
      "icon": "my-almighty-longbow-of-endurance.png"
  }
  ```

  If you stored your icons in the directory `iconizer`, you would set the prefix to `iconizer`, and the icon URL will be set to `iconizer/my-almighty-longbow-of-endurance.png`.

  If you stored your icons in an S3 bucket, you can set the prefix to `https://my-s3.storage.com/bucket` and the resulting URL would be `https://my-s3.storage.com/bucket/my-almighty-longbow-of-endurance.png`.

  Furthermore: Your dictionary entries can now contain absolute paths to icons:

  ```
  {
      "name": "Longbow",
      "icon": "my-almighty-longbow-of-endurance.png"
  },
  {
      "name": "Axe",
      "icon": "/my/absolute/path/to/axe.jpg"
  },
  {
      "name": "Shield +1",
      "icon": "https://awesomeicons.com/shield.gif"
  }
  ```

  The first entry will be prefixed with the `Icon prefix`, while both the Axe and the shield will not be changed.

- Added a dictionary referencing all items that are currently coming in the compendiums of the DnD5e game system. You can update this dictionary by running the node.js script located at `/modules/vtta-iconizer/data/extract-items.js`. Change into said directory and run `node extract-items.js` to update the "foundry-icons.json" file.

- Added a dictionary referencing the same World of Warcraft icons, but using a online resource instead of a local icon library. This feature is experimental and might be removed in the future.

## [2.0.0]

Feature parity release for the relaunch of VTTAssets

## [1.0.5]

### Added

- Compatibility for Foundry VTT v0.4.4 and higher
- Enabling or disable via CONFIG: `CONFIG.debug.vtta.iconizer = TRUE|FALSE` enables or disables debug logging in the console.log. Defaults to `false`

### Removed

- Compatibility for Foundry VTT v0.4.3 and lower

### Fixed

- Fixed bugs regarding changing icons only when the default icon is currently set (which wasn't working very well - it now does ;))

## [1.0.4] - 2020-01-02

### Added

- Multiple Icons (Thanks @tposney for contributing!)

- Used [Azzurite's Settings Extender](https://gitlab.com/foundry-azzurite/settings-extender) to simplify configuration

## [1.0.3] - 2019-20-21

### Changed

- Removing parts in paranthesis when looking up a suitable icon
- Added Event Handler for other modules to query for suitable icons based on a { name: 'name' } query

## [1.0.2] - 2019-20-11

### Added

- Included the vast icon database previously only available for Patreons into the initial re-release, see /vtta-tokeniuzer/data/icons.json. Please feel free to hit me up with any changes and additions for this database! While I do provide a massive jumpstart and a big incentive to use this database, it would be awesome if the community could complete the missing icons together!

### Changed

- Initial re-release for Foundry v0.4.0
- Rewrote the whole module as ES6 module for easier maintenance in the future

### Deprecated

### Removed

- Support for Foundry v0.3.9 and prior
