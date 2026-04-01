# Changelog

All notable changes to the Ren'Py Magic extension will be documented in this file.

## [1.0.7] - Unreleased

### Fixed
- Auto-completion no longer triggers in wrong contexts (inside strings, on space for indentation)
- Space trigger character now only activates for `jump` and `call` completions

## [1.0.6] - 2026-03-30

### Fixed
- Documentation and metadata fixes

## [1.0.5] - 2026-03-30

### Fixed
- Fixed repository name in metadata

## [1.0.4] - 2026-03-30

### Changed
- Updated documentation and README with screenshots
- Added more tests

### Fixed
- Fixed website build for image assets

## [1.0.3] - 2026-03-30

### Added

- Optional `warnUndefinedImages` setting to warn when `show`/`scene` references an undefined image (disabled by default)

### Fixed

- Fixed incorrect detection of screens (init prefix handling)
- Fixed detection of missing assets timing issue (validation now runs after indexing)

## [0.1.0] - 2026-03-27

### Added
- Full syntax highlighting for `.rpy` and `.rpym` files
- Hover documentation with 730+ API entries from official Ren'Py documentation
  - `config.*` variables (286 entries)
  - `gui.*` variables (107 entries)
  - `build.*` variables (18 entries)
  - Actions, style properties, transform properties, classes, and transitions
- Go to Symbol in Editor (Cmd+Shift+O / Ctrl+Shift+O)
- Workspace Symbol Search (Cmd+T / Ctrl+T)
- Go to Definition (F12) for labels, screens, images, transforms, and functions
- Find All References (Shift+F12)
- Rename Symbol (F2)
- Context-aware completions
  - Namespace completions for `config.`, `gui.`, `build.`
  - ATL and transform properties
  - Style properties and screen properties
  - Built-in transitions
  - Labels and screens
- Signature help for 60+ Ren'Py functions
- Diagnostics for undefined labels, screens, and mismatched quotes
