# companion-module-behringer-wing

See also HELP.md and LICENSE

# Changelog

## 2.2.4

### Fixed

- Changed name of `variables/aux.ts` to `variables/auxiliary.ts` to avoid build issues on Windows

### Added

- Added pre-push checks to ensure package version, README.md and git tag are in sync

### Changed

- Refactored module for easier maintainability and expansion

## 2.2.3

### Fixed

- Fixed mishandling of undefined variable in config file that would prevent a fresh instance of the module from starting

### Added

- Added variables for channel, aux, bus, dca, matrix and main color names

## 2.2.0

### Added

- Action to set the channel "Main Input Source" -> "Set Channel/Aux Main Connection"
- Action to set the channel "Alt Input Source" -> "Set Channel/Aux Alt Connection"
- Action to set the automatic switch between Main and Alt input source -> "Set Channel/Aux Auto Source Switch"
- Action to select whether a channel uses the Main or Alt input source -> "Set Channel/Aux Switch"
- Action to edit a channel strip's Icon -> "Set Channel Icon"
- Action to recall a schene by name -> "Recall Scene by Name"
- Action to recall a scene by number -> "Recall Scene by Number"
- Action to set light intensities of various console light sources -> "Set Light Intensities"
- New colors for Wing firmware 3.1
- Module option to prefetch all variables on startup
- Module option to enable forwarding of OSC messages from the Wing to another host with programmable IP and Port
- Presets for "Bright Lights" and "Dark Lights"
- All channel selection dropdowns now support selection using variables
- Issue Templates for bug reports and feature requests
- HELP.md file

### Changed

- Version bumb of companion-module/base to 1.13
- Renamed color "Orange" to "Brown"
- Loads of under-the-hood refactoring and code cleanup for future release with better maintainability

## 2.1.0

### Added

- Added unified send level, pan, and mute actions for all supported send combinations
- Added main/alt toggle action
- Added actions to enable/disable gate, dynamics, EQ, and inserts on supported channel strips
- Added save action
- Added more WLive actions, variables, and feedbacks
- Added SoF and Selected channel actions and variables

### Changed

- Fixed issue where increment/decrement actions would not work correctly when current value is -inf

## 2.0.0

### Added

- Support for Companion 3.0
- Device discovery listing Behringer Wing devices in configuration screen (inspired by [Behringer X32](https://github.com/bitfocus/companion-module-behringer-x32/tree/master))
- Fade-Curve Easings (copied from [Behringer X32](https://github.com/bitfocus/companion-module-behringer-x32/tree/master))
- Support for Wing Rack and Wing Comapct
- Added Commands:
  - Adjust Gain / Main to Matrix Level / Panorama / Send Panorama
  - Store Gain / Main to Matrix Level / Panorama / Send Panorama
  - Restore Gain / Main to Matrix Level / Panorama / Send Panorama
  - Undo Gain / Main to Matrix Level / Panorama / Send Panorama Adjust
  - Set Gain / Main to Matrix Level / Panorama / Send Panorama
  - Send Command
  - Send Command with Number
  - Set Channel EQ Model
  - Set Channel Filter Model
  - Set Channel Main Connection
  - Set Channel Process Order
  - Set Solo LR Swap
  - WLive: Set Link / Set Auto Input / Set Auto Stop / Set Auto Play / Set Auto Record / Card Action / Add Marker / Format Card
  - USB: Playback Action / Set Repeat / Record Action

### Changed

- Re-structued repository to accomodate for large number of commands (inspired by [ATEM](https://github.com/bitfocus/companion-module-bmd-atem))

  - chaned from `action.ts` to `action/` as directory with one file per category
  - OSC commands are documented the `commands/` directory, with one file per category. Each command category is its own namespace.

- Changed command names and unified commands:
  - Bus Send Level Adjust -> Adjust Send Level
  - Bus Send Level Recall -> Restore Send Level
  - Bus Send Level Set -> Set Send Level
  - Bus Send On -> Set Send Mute
  - Ch, Aux Send Level Adjust -> Adjust Send Level
  - Ch, Aux Send Level Recall -> Restore Send Level
  - Ch, Aux Send Level Set -> Set Send Level
  - Ch, Aux Send Level Store -> Store Send Level
  - Color -> Set Color
  - Fader Adjust -> Adjust Level
  - Fader Recall -> Restore Level
  - Fader Set -> Set Level
  - Fader Store -> Store Level
  - Icon -> Set Channel Icon
  - LED -> Set Scribble Light
  - Main Send Level Adjust -> Adjust Main Send Level
  - Main Send Level Recall -> Restore Main Send Level
  - Main Send Level Set -> Set Main Send Level
  - Main Send Level Store -> Set Main Send Mute
  - Mute -> Set Mute
  - Name -> Set Name
  - Solo -> Set Solo
  - Solo Clear -> Clear Solo
  - Solo Dim -> Set Solo Dim
  - Solo Mono -> Set Solo Mono
  - Solo Mute -> Set Solo Mute

## 1.0.4

### Fixed

- Fix DCA Channel count (16 not 8)

## 1.0.3

### Fixed

- Fix remaining switch/toggle actions

## 1.0.2

### Fixed

- Fix Repo URL in HELP.md

## 1.0.1

### Fixed

- Fix typos on certain mute actions

## 1.0.0

### Added

- Implement a 'Clear All Solo' function

### Changed

- Cleanup: remove excess debugging code

## 0.9.2

### Added

- Talkback bus control

## 0.9.1

### Added

- Feedback and Variables

## 0.9.0

### Changed

- Protocol update

## 0.5.0

### Added

- Initial release / testing
- Fader, Mute, LED, Colors, Solo, Sends
- With dynamic variables and Feedback
