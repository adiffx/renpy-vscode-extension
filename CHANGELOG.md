# Changelog

All notable changes to the Ren'Py Language Support extension will be documented in this file.

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
