# Ren'Py Language Support

A Visual Studio Code extension providing language support for [Ren'Py](https://www.renpy.org/) visual novel engine.

## Features

### Syntax Highlighting
- Full syntax highlighting for `.rpy` and `.rpym` files
- Supports Ren'Py keywords, ATL (Animation and Transformation Language), Python blocks
- String interpolation and text tags highlighted within strings

### Hover Documentation
- Hover over Ren'Py keywords, functions, and classes to see documentation
- Covers 730+ API entries fetched from official Ren'Py documentation:
  - **config.\*** variables (286 entries): `config.name`, `config.screen_width`, etc.
  - **gui.\*** variables (107 entries): `gui.text_color`, `gui.show_name`, etc.
  - **build.\*** variables (18 entries): `build.name`, `build.directory_name`, etc.
  - **Actions** (47 entries): `Jump`, `Call`, `Show`, `Hide`, `Set`, `Return`, etc.
  - **Style properties** (129 entries): `background`, `padding`, `color`, etc.
  - **Transform properties** (52 entries): `xpos`, `ypos`, `alpha`, `zoom`, etc.
  - **Classes and transitions**: `Transform`, `Dissolve`, `Fade`, etc.
- Supports dotted names: hover over `config.name` to see full documentation

### Go to Symbol in Editor (Cmd+Shift+O / Ctrl+Shift+O)
- Jump to labels, screens, transforms, images, defines, defaults, styles, and layeredimages within the current file
- Supports local labels (`.labelname`)

### Workspace Symbol Search (Cmd+T / Ctrl+T)
- Search for symbols across all `.rpy` files in your workspace
- Find labels, screens, transforms, images, defines, defaults, styles, layeredimages, and Python functions/classes

### Go to Definition (F12)
- Jump to the definition of:
  - Labels (from `jump` or `call` statements)
  - Screens (from `show screen`, `call screen`, or `use` statements)
  - Images (from `show`, `scene`, or `hide` statements)
  - Transforms
  - Python functions and variables
- Flexible image name matching handles Ren'Py's space-separated image naming

### Find All References (Shift+F12)
- Find all usages of a symbol across your workspace
- Works for labels, screens, images, and variables

### Rename Symbol (F2)
- Rename a label, screen, or variable and update all references across the workspace

### Completions
- Context-aware completions for:
  - Ren'Py keywords and statements
  - ATL keywords
  - Transform properties (after `at` or in transform blocks)
  - Style properties (in style blocks)
  - Screen properties and `style_prefix` values
  - Built-in transitions (after `with`)
  - Labels (after `jump` or `call`)
  - Screens (after `call screen` or `show screen`)
  - Built-in Ren'Py API
- **Namespace completions**: Type `config.`, `gui.`, or `build.` to see all available variables
- Smart suppression: completions stop after completing a `config.xxx =` assignment

### Signature Help
- Parameter hints when typing function calls
- Covers 60+ Ren'Py functions including:
  - Transitions: `Dissolve()`, `Fade()`, `ImageDissolve()`, etc.
  - Displayables: `Character()`, `Transform()`, `Text()`, `Frame()`, etc.
  - Actions: `SetVariable()`, `Jump()`, `Call()`, `Show()`, `Hide()`, etc.
  - `renpy.*` functions: `renpy.pause()`, `renpy.say()`, `renpy.show()`, etc.
  - `renpy.music.*` and `renpy.sound.*` functions
  - Image manipulation: `im.Composite()`, `im.Scale()`, `LiveComposite()`, etc.

### Diagnostics
- Warnings for:
  - Undefined labels in `jump`/`call` statements
  - Undefined local labels (`.labelname`)
  - Undefined screens in `call screen`, `show screen`, or `use` statements
- Errors for:
  - Mismatched quotes (with proper handling of triple-quoted strings)
- Recognizes built-in screens: `save`, `load`, `preferences`, `main_menu`, `game_menu`, `confirm`, `history`, `quick_menu`, etc.
- Recognizes built-in images: `black`, `white`, `transparent`
- Properly skips diagnostics inside comments and multiline strings

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open the folder in VS Code
3. Run `npm install` to install dependencies
4. Run `npm run compile` to build
5. Press F5 to launch the Extension Development Host

### Usage

1. Open a folder containing `.rpy` files
2. The extension activates automatically when you open a Ren'Py file
3. If you have another Ren'Py extension installed, you may need to disable it to avoid conflicts

## Development

### Running Tests

```bash
npm test
```

Tests cover:
- Pattern matching for labels, screens, images, comments, multiline strings
- Completion logic: namespace matching, suppression after assignments
- Hover functionality: documentation lookup, namespace queries
- Symbol extraction patterns for go-to-definition
- Generated API data structure and content validation

### Updating API Documentation

The extension fetches API documentation from the official Ren'Py GitHub repository. To update:

```bash
npm run fetch-api
npm run compile
```

This fetches documentation from RST files and Ren'Py source code, generating `src/server/renpy-api.json`.

## Known Limitations

- Python code within Ren'Py files gets basic syntax highlighting but not full Python language server features
- Image validation doesn't check for file-based images (only code-defined images)
- Local label validation is file-scoped

## Requirements

- VS Code 1.75.0 or higher
- No external dependencies required (pure TypeScript implementation)

## License

MIT
