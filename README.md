# companion-module-behringer-wing
See also HELP.md and LICENSE


# Changelog

## 2.0.0

### Added
- Support for Companion 3.0
- Device discovery listing Behringer Wing devices in configuration screen (inspired by [Behringer X32](https://github.com/bitfocus/companion-module-behringer-x32/tree/master))
- Fade-Curve Easings (copied from [Behringer X32](https://github.com/bitfocus/companion-module-behringer-x32/tree/master))
- Support for Wing Rack and Wing Comapct

### Changed
- Re-structued repository to accomodate for large number of commands (inspired by [ATEM](https://github.com/bitfocus/companion-module-bmd-atem))
    - chaned from `action.ts` to `action/` as directory with one file per category
    - OSC commands are documented the `commands/` directory, with one file per category. Each command category is its own namespace.

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