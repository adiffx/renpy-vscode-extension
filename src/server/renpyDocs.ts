// Ren'Py built-in API documentation for hover information

import * as fs from 'fs';
import * as path from 'path';

export interface DocEntry {
	signature: string;
	description: string;
	category: 'class' | 'function' | 'action' | 'transition' | 'statement' | 'variable' | 'property';
}

// Load the generated API data
interface ApiEntry {
	name: string;
	signature: string;
	description: string;
	category: 'variable' | 'function' | 'action' | 'class' | 'property' | 'transition';
	namespace?: string;
}

interface ApiData {
	version: string;
	generated: string;
	entries: ApiEntry[];
}

let generatedDocs: Record<string, DocEntry> = {};

// Try to load generated API data
try {
	const apiPath = path.join(__dirname, 'renpy-api.json');
	if (fs.existsSync(apiPath)) {
		const apiData: ApiData = JSON.parse(fs.readFileSync(apiPath, 'utf-8'));
		for (const entry of apiData.entries) {
			generatedDocs[entry.name] = {
				signature: entry.signature,
				description: entry.description,
				category: entry.category
			};
		}
		console.log(`Loaded ${apiData.entries.length} entries from renpy-api.json (v${apiData.version})`);
	}
} catch (e) {
	console.error('Failed to load renpy-api.json:', e);
}

export const renpyDocs: Record<string, DocEntry> = {
	// Characters
	"Character": {
		signature: "Character(name, kind=adv, **properties)",
		description: `A Character object represents a character in the game. It stores information about the character's name, what style should be used for the character's dialogue, and other properties.

**Parameters:**
- \`name\` - The name of the character, used for dialogue
- \`kind\` - The kind of character (adv or nvl)
- \`image\` - An image tag associated with this character
- \`voice_tag\` - A voice tag used for voice acting
- \`what_prefix/what_suffix\` - Text added before/after dialogue`,
		category: 'class'
	},
	"DynamicCharacter": {
		signature: "DynamicCharacter(name_expr, **properties)",
		description: `A character whose name is computed dynamically from an expression.

**Parameters:**
- \`name_expr\` - A string giving a Python expression that evaluates to the character's name`,
		category: 'class'
	},

	// Displayables
	"DynamicDisplayable": {
		signature: "DynamicDisplayable(function, *args, **kwargs)",
		description: `A displayable that can change its child based on a Python function, over the course of an interaction.

**function** - A function called with:
- The amount of time the displayable has been shown for
- The amount of time any displayable with the same tag has been shown for
- Any positional or keyword arguments supplied to DynamicDisplayable

Should return a \`(d, redraw)\` tuple, where:
- \`d\` is a displayable to show
- \`redraw\` is the number of seconds to wait before calling the function again, or None to not redraw`,
		category: 'class'
	},
	"Solid": {
		signature: "Solid(color, **properties)",
		description: `A displayable that fills the area with a solid color.

**Parameters:**
- \`color\` - The color to fill with. Can be a hex string ("#rgb", "#rgba", "#rrggbb", "#rrggbbaa") or a Color object`,
		category: 'class'
	},
	"Frame": {
		signature: "Frame(image, left=0, top=0, right=None, bottom=None, tile=False, **properties)",
		description: `A displayable that resizes an image to fill the available area while preserving corners and edges.

**Parameters:**
- \`image\` - The image to use as a frame
- \`left, top, right, bottom\` - The size of the borders that should not be scaled
- \`tile\` - If True, tiles the center and sides rather than scaling`,
		category: 'class'
	},
	"Null": {
		signature: "Null(width=0, height=0, **properties)",
		description: `A displayable that doesn't draw anything, but takes up space.

**Parameters:**
- \`width\` - The width of the null displayable
- \`height\` - The height of the null displayable`,
		category: 'class'
	},
	"Text": {
		signature: "Text(text, **properties)",
		description: `A displayable that displays text.

**Parameters:**
- \`text\` - The text to display. May contain text tags like {b}bold{/b}
- \`slow\` - If True, the text is displayed slowly
- \`style\` - The style to use`,
		category: 'class'
	},
	"Image": {
		signature: "Image(filename, **properties)",
		description: `A displayable that displays an image loaded from a file.

**Parameters:**
- \`filename\` - The filename of the image to load`,
		category: 'class'
	},
	"Composite": {
		signature: "Composite(size, *args, **properties)",
		description: `A displayable that composites multiple displayables together.

**Parameters:**
- \`size\` - A (width, height) tuple giving the size
- \`args\` - Alternating (x, y) positions and displayables`,
		category: 'class'
	},
	"ConditionSwitch": {
		signature: "ConditionSwitch(*args, **properties)",
		description: `A displayable that changes based on conditions.

**Parameters:**
- \`args\` - Alternating Python condition strings and displayables. The first condition that evaluates to True determines which displayable is shown.

Example:
\`\`\`
ConditionSwitch(
		"happy", "eileen happy.png",
		"True", "eileen neutral.png"
)
\`\`\``,
		category: 'class'
	},
	"Transform": {
		signature: "Transform(child=None, **properties)",
		description: `A displayable that applies transformations to its child.

**Common Properties:**
- \`pos\`, \`xpos\`, \`ypos\` - Position
- \`anchor\`, \`xanchor\`, \`yanchor\` - Anchor point
- \`align\`, \`xalign\`, \`yalign\` - Combined position and anchor
- \`zoom\`, \`xzoom\`, \`yzoom\` - Scaling
- \`rotate\` - Rotation in degrees
- \`alpha\` - Opacity (0.0 to 1.0)
- \`crop\` - Crop rectangle (x, y, width, height)`,
		category: 'class'
	},
	"Movie": {
		signature: "Movie(fps=24, size=None, channel='movie', play=None, mask=None, **properties)",
		description: `A displayable that plays a movie file.

**Parameters:**
- \`fps\` - The framerate of the movie
- \`size\` - The size to display the movie at
- \`channel\` - The audio channel to play sound on
- \`play\` - The movie file to play`,
		category: 'class'
	},
	"HBox": {
		signature: "HBox(*children, **properties)",
		description: `A box that displays its children horizontally, from left to right.

**Properties:**
- \`spacing\` - Space between children in pixels
- \`first_spacing\` - Space before the first child`,
		category: 'class'
	},
	"VBox": {
		signature: "VBox(*children, **properties)",
		description: `A box that displays its children vertically, from top to bottom.

**Properties:**
- \`spacing\` - Space between children in pixels
- \`first_spacing\` - Space before the first child`,
		category: 'class'
	},
	"Grid": {
		signature: "Grid(cols, rows, *children, **properties)",
		description: `A container that arranges its children in a grid.

**Parameters:**
- \`cols\` - Number of columns
- \`rows\` - Number of rows
- \`children\` - The displayables to arrange
- \`spacing\` - Space between cells`,
		category: 'class'
	},
	"Fixed": {
		signature: "Fixed(*children, **properties)",
		description: `A container that allows positioning children at arbitrary locations.

Children should set their own positions using properties like pos, xpos, ypos, align, etc.`,
		category: 'class'
	},
	"Viewport": {
		signature: "Viewport(child, **properties)",
		description: `A displayable that allows scrolling through content larger than the viewport.

**Properties:**
- \`xadjustment\`, \`yadjustment\` - Adjustment objects for scroll position
- \`scrollbars\` - Where to show scrollbars ("both", "horizontal", "vertical", None)
- \`mousewheel\` - Enable mouse wheel scrolling
- \`draggable\` - Allow dragging to scroll`,
		category: 'class'
	},
	"Drag": {
		signature: "Drag(d=None, **properties)",
		description: `A displayable that can be dragged around the screen.

**Properties:**
- \`drag_name\` - A name for this drag
- \`draggable\` - If True, can be dragged
- \`droppable\` - If True, can receive drops
- \`dragged\` - Callback when drag completes
- \`dropped\` - Callback when something is dropped on this`,
		category: 'class'
	},
	"Color": {
		signature: "Color(color)",
		description: `Represents an RGBA color.

**Parameters:**
- \`color\` - Can be:
	- A hex string: "#rgb", "#rgba", "#rrggbb", "#rrggbbaa"
	- A tuple: (r, g, b) or (r, g, b, a) with values 0-255
	- Another Color object

**Methods:**
- \`interpolate(other, fraction)\` - Interpolate between colors
- \`replace_opacity(opacity)\` - Return color with new opacity`,
		category: 'class'
	},

	// Transitions
	"Dissolve": {
		signature: "Dissolve(time, alpha=False, time_warp=None)",
		description: `A transition that dissolves from one scene to the next.

**Parameters:**
- \`time\` - The time the dissolve will take, in seconds
- \`alpha\` - If True, the dissolve uses the alpha channel
- \`time_warp\` - A function that maps time (0.0-1.0) to display progress`,
		category: 'transition'
	},
	"Fade": {
		signature: "Fade(out_time, hold_time, in_time, color='#000')",
		description: `A transition that fades to a color, holds, then fades to the new scene.

**Parameters:**
- \`out_time\` - Time to fade to color
- \`hold_time\` - Time to hold on color
- \`in_time\` - Time to fade from color to new scene
- \`color\` - The color to fade to (default black)`,
		category: 'transition'
	},
	"ImageDissolve": {
		signature: "ImageDissolve(image, time, ramplen=8, reverse=False, alpha=True, time_warp=None)",
		description: `A transition that dissolves using a grayscale image as a pattern.

**Parameters:**
- \`image\` - A grayscale image. White areas dissolve first, black areas last
- \`time\` - The time the transition takes
- \`ramplen\` - The length of the ramp in pixels
- \`reverse\` - If True, reverses the direction`,
		category: 'transition'
	},
	"Pixellate": {
		signature: "Pixellate(time, steps)",
		description: `A transition that pixellates the old scene, then unpixellates the new scene.

**Parameters:**
- \`time\` - The time the transition takes
- \`steps\` - The number of pixellation steps`,
		category: 'transition'
	},
	"MoveTransition": {
		signature: "MoveTransition(delay, enter=None, leave=None, old=False, layers=['master'])",
		description: `A transition that moves images to their new locations.

**Parameters:**
- \`delay\` - The time the transition takes
- \`enter\` - A transition to use for entering images
- \`leave\` - A transition to use for leaving images`,
		category: 'transition'
	},
	"PushMove": {
		signature: "PushMove(time, mode='pushright')",
		description: `A transition that pushes the old scene off while bringing the new scene in.

**Parameters:**
- \`time\` - The time the transition takes
- \`mode\` - One of: "pushright", "pushleft", "pushup", "pushdown"`,
		category: 'transition'
	},
	"CropMove": {
		signature: "CropMove(time, mode='slideright', startcrop=None, startpos=None, endcrop=None, endpos=None)",
		description: `A transition that works by cropping and positioning scenes.

**Parameters:**
- \`time\` - The time the transition takes
- \`mode\` - Preset mode: "slideright", "slideleft", etc.`,
		category: 'transition'
	},

	// Actions
	"Return": {
		signature: "Return(value=None)",
		description: `Returns a value from a screen or interaction.

When used in a screen, this closes the screen and returns the value. Equivalent to calling \`renpy.return_statement()\`.

**Parameters:**
- \`value\` - The value to return`,
		category: 'action'
	},
	"Jump": {
		signature: "Jump(label)",
		description: `Jumps to a label when activated.

**Parameters:**
- \`label\` - The label to jump to. Can be a string or an expression.`,
		category: 'action'
	},
	"Call": {
		signature: "Call(label, *args, **kwargs)",
		description: `Calls a label when activated, returning to the current location when the called label returns.

**Parameters:**
- \`label\` - The label to call
- \`args\`, \`kwargs\` - Arguments to pass to the label`,
		category: 'action'
	},
	"Show": {
		signature: "Show(screen, transition=None, **kwargs)",
		description: `Shows a screen when activated.

**Parameters:**
- \`screen\` - The name of the screen to show
- \`transition\` - A transition to use
- \`kwargs\` - Arguments to pass to the screen`,
		category: 'action'
	},
	"Hide": {
		signature: "Hide(screen, transition=None)",
		description: `Hides a screen when activated.

**Parameters:**
- \`screen\` - The name of the screen to hide
- \`transition\` - A transition to use`,
		category: 'action'
	},
	"Play": {
		signature: "Play(channel, file, **kwargs)",
		description: `Plays a sound or music file when activated.

**Parameters:**
- \`channel\` - The channel to play on ('music', 'sound', 'voice', etc.)
- \`file\` - The file to play
- \`loop\` - If True, loop the audio
- \`fadein\` - Time to fade in
- \`fadeout\` - Time to fade out previous audio`,
		category: 'action'
	},
	"Stop": {
		signature: "Stop(channel, fadeout=0)",
		description: `Stops audio on a channel when activated.

**Parameters:**
- \`channel\` - The channel to stop
- \`fadeout\` - Time to fade out`,
		category: 'action'
	},
	"Queue": {
		signature: "Queue(channel, file, **kwargs)",
		description: `Queues a sound file to play after the current one finishes.

**Parameters:**
- \`channel\` - The channel to queue on
- \`file\` - The file to queue`,
		category: 'action'
	},
	"SetVariable": {
		signature: "SetVariable(name, value)",
		description: `Sets a variable to a value when activated.

**Parameters:**
- \`name\` - The name of the variable to set (as a string)
- \`value\` - The value to set it to`,
		category: 'action'
	},
	"SetField": {
		signature: "SetField(object, field, value)",
		description: `Sets a field on an object when activated.

**Parameters:**
- \`object\` - The object to modify
- \`field\` - The name of the field (as a string)
- \`value\` - The value to set`,
		category: 'action'
	},
	"SetDict": {
		signature: "SetDict(dict, key, value)",
		description: `Sets a key in a dictionary when activated.

**Parameters:**
- \`dict\` - The dictionary to modify
- \`key\` - The key to set
- \`value\` - The value to set`,
		category: 'action'
	},
	"ToggleVariable": {
		signature: "ToggleVariable(name)",
		description: `Toggles a boolean variable between True and False.

**Parameters:**
- \`name\` - The name of the variable to toggle`,
		category: 'action'
	},
	"If": {
		signature: "If(condition, true_action, false_action=None)",
		description: `Performs one of two actions based on a condition.

**Parameters:**
- \`condition\` - A Python expression to evaluate
- \`true_action\` - Action to perform if condition is true
- \`false_action\` - Action to perform if condition is false`,
		category: 'action'
	},
	"Notify": {
		signature: "Notify(message)",
		description: `Displays a notification message.

**Parameters:**
- \`message\` - The message to display`,
		category: 'action'
	},
	"ShowMenu": {
		signature: "ShowMenu(screen='preferences')",
		description: `Shows a menu screen.

**Parameters:**
- \`screen\` - The menu screen to show (default: 'preferences')`,
		category: 'action'
	},
	"MainMenu": {
		signature: "MainMenu(confirm=True)",
		description: `Returns to the main menu.

**Parameters:**
- \`confirm\` - If True, asks for confirmation`,
		category: 'action'
	},
	"Quit": {
		signature: "Quit(confirm=True)",
		description: `Quits the game.

**Parameters:**
- \`confirm\` - If True, asks for confirmation`,
		category: 'action'
	},
	"Confirm": {
		signature: "Confirm(prompt, yes_action, no_action=None, confirm_selected=False)",
		description: `Shows a confirmation dialog.

**Parameters:**
- \`prompt\` - The prompt to display
- \`yes_action\` - Action to perform if user confirms
- \`no_action\` - Action to perform if user cancels`,
		category: 'action'
	},
	"Function": {
		signature: "Function(callable, *args, **kwargs)",
		description: `Calls a Python function when activated.

**Parameters:**
- \`callable\` - The function to call
- \`args\`, \`kwargs\` - Arguments to pass to the function`,
		category: 'action'
	},
	"OpenURL": {
		signature: "OpenURL(url)",
		description: `Opens a URL in the system browser.

**Parameters:**
- \`url\` - The URL to open`,
		category: 'action'
	},
	"FileSave": {
		signature: "FileSave(name, confirm=True, newest=True, page=None, cycle=False)",
		description: `Saves the game to a file slot.

**Parameters:**
- \`name\` - The save slot name
- \`confirm\` - Ask for confirmation if overwriting
- \`newest\` - Mark as newest save`,
		category: 'action'
	},
	"FileLoad": {
		signature: "FileLoad(name, confirm=True, page=None, newest=True)",
		description: `Loads the game from a file slot.

**Parameters:**
- \`name\` - The save slot name
- \`confirm\` - Ask for confirmation`,
		category: 'action'
	},
	"FileDelete": {
		signature: "FileDelete(name, confirm=True, page=None)",
		description: `Deletes a save file.

**Parameters:**
- \`name\` - The save slot name
- \`confirm\` - Ask for confirmation`,
		category: 'action'
	},
	"Rollback": {
		signature: "Rollback()",
		description: `Rolls back to the previous checkpoint in the game.`,
		category: 'action'
	},
	"RollForward": {
		signature: "RollForward()",
		description: `Rolls forward after a rollback.`,
		category: 'action'
	},
	"NullAction": {
		signature: "NullAction()",
		description: `An action that does nothing. Useful as a placeholder.`,
		category: 'action'
	},

	// Config variables
	"config": {
		signature: "config",
		description: `The config namespace contains many configuration variables that control Ren'Py's behavior.

**Common variables:**
- \`config.name\` - The name of the game
- \`config.version\` - The version string
- \`config.screen_width\`, \`config.screen_height\` - Screen dimensions
- \`config.window_title\` - Window title
- \`config.save_directory\` - Save directory name
- \`config.default_music_volume\` - Default music volume
- \`config.main_menu_music\` - Music to play on main menu`,
		category: 'variable'
	},
	"persistent": {
		signature: "persistent",
		description: `The persistent namespace contains data that persists between game sessions.

Variables stored here are saved automatically and survive game restarts. Useful for:
- Unlocked gallery images
- Achievement tracking
- Player preferences
- Completion flags

Example:
\`\`\`
$ persistent.game_complete = True
if persistent.game_complete:
		"You've finished the game before!"
\`\`\``,
		category: 'variable'
	},
	"preferences": {
		signature: "preferences",
		description: `The preferences namespace contains player preferences.

**Common variables:**
- \`preferences.text_speed\` - Text display speed
- \`preferences.auto_forward_time\` - Auto-forward delay
- \`preferences.fullscreen\` - Fullscreen mode
- \`preferences.skip_unseen\` - Skip unseen text
- \`preferences.skip_after_choices\` - Stop skipping at choices`,
		category: 'variable'
	},
	"renpy": {
		signature: "renpy",
		description: `The renpy namespace provides access to Ren'Py's Python API.

**Common functions:**
- \`renpy.pause()\` - Pause for a duration
- \`renpy.say()\` - Display dialogue
- \`renpy.jump()\` - Jump to a label
- \`renpy.call()\` - Call a label
- \`renpy.return_statement()\` - Return from a call
- \`renpy.show()\` - Show an image
- \`renpy.hide()\` - Hide an image
- \`renpy.scene()\` - Clear the scene
- \`renpy.with_statement()\` - Apply a transition
- \`renpy.input()\` - Get text input
- \`renpy.notify()\` - Show a notification`,
		category: 'variable'
	},
	"store": {
		signature: "store",
		description: `The store namespace is the default namespace for game variables.

Variables defined with \`define\` or \`default\` are stored here. You can also access them directly by name without the "store." prefix.

Example:
\`\`\`
default my_variable = 0
# Both of these work:
$ store.my_variable = 1
$ my_variable = 1
\`\`\``,
		category: 'variable'
	},

	// im namespace
	"im": {
		signature: "im",
		description: `The im namespace provides image manipulators for transforming images.

**Common manipulators:**
- \`im.Scale(image, width, height)\` - Scale an image
- \`im.Crop(image, rect)\` - Crop an image
- \`im.Composite(size, *positions_and_images)\` - Composite images
- \`im.Alpha(image, alpha)\` - Adjust alpha
- \`im.Grayscale(image)\` - Convert to grayscale
- \`im.Sepia(image)\` - Apply sepia tone
- \`im.Flip(image, horizontal, vertical)\` - Flip an image`,
		category: 'variable'
	},

	// Screen language keywords
	"textbutton": {
		signature: "textbutton text action=None **properties",
		description: `A button with a text label.

**Parameters:**
- \`text\` - The text to display
- \`action\` - Action to perform when clicked

**Common properties:**
- \`style\` - Style to apply
- \`text_style\` - Style for the text
- \`sensitive\` - If False, button is disabled
- \`hovered\` - Action when hovered
- \`alternate\` - Action for right-click`,
		category: 'statement'
	},
	"imagebutton": {
		signature: "imagebutton auto=None idle=None hover=None action=None **properties",
		description: `A button with image states.

**Parameters:**
- \`auto\` - Base filename pattern (replaces %s with state)
- \`idle\` - Image when not hovered
- \`hover\` - Image when hovered
- \`selected_idle\`, \`selected_hover\` - Selected states
- \`insensitive\` - Image when disabled
- \`action\` - Action when clicked`,
		category: 'statement'
	},
	"button": {
		signature: "button action=None **properties",
		description: `A button that contains other displayables.

**Parameters:**
- \`action\` - Action to perform when clicked

Use \`has\` to add a child container, then add displayables to it.`,
		category: 'statement'
	},
	"text": {
		signature: "text string **properties",
		description: `Displays text in a screen.

**Parameters:**
- \`string\` - The text to display

**Common properties:**
- \`style\` - Style to apply
- \`size\` - Font size
- \`color\` - Text color
- \`font\` - Font file
- \`bold\`, \`italic\`, \`underline\` - Text formatting`,
		category: 'statement'
	},
	"add": {
		signature: "add displayable **properties",
		description: `Adds a displayable to the screen.

**Parameters:**
- \`displayable\` - An image name, filename, or displayable

**Common properties:**
- \`at\` - Transform to apply
- \`pos\`, \`xpos\`, \`ypos\` - Position
- \`anchor\`, \`xanchor\`, \`yanchor\` - Anchor point
- \`zoom\`, \`alpha\` - Scaling and opacity`,
		category: 'statement'
	},
	"use": {
		signature: "use screen_name *args **kwargs",
		description: `Includes another screen in this screen.

**Parameters:**
- \`screen_name\` - The name of the screen to include
- \`args\`, \`kwargs\` - Arguments to pass to the screen`,
		category: 'statement'
	},
	"vbox": {
		signature: "vbox **properties",
		description: `A vertical box that displays children from top to bottom.

**Common properties:**
- \`spacing\` - Space between children
- \`xalign\`, \`yalign\` - Alignment
- \`box_wrap\` - Wrap children to multiple columns`,
		category: 'statement'
	},
	"hbox": {
		signature: "hbox **properties",
		description: `A horizontal box that displays children from left to right.

**Common properties:**
- \`spacing\` - Space between children
- \`xalign\`, \`yalign\` - Alignment
- \`box_wrap\` - Wrap children to multiple rows`,
		category: 'statement'
	},
	"frame": {
		signature: "frame **properties",
		description: `A container that displays a background behind its children.

**Common properties:**
- \`background\` - The background displayable
- \`padding\` - Padding around children
- \`xpadding\`, \`ypadding\` - Horizontal/vertical padding`,
		category: 'statement'
	},
	"window": {
		signature: "window **properties",
		description: `A window, typically used for dialogue display.

**Common properties:**
- \`background\` - The background displayable
- \`padding\` - Padding around content`,
		category: 'statement'
	},
	"viewport": {
		signature: "viewport **properties",
		description: `A scrollable viewport in a screen.

**Common properties:**
- \`scrollbars\` - Show scrollbars ("both", "horizontal", "vertical", None)
- \`mousewheel\` - Enable mouse wheel scrolling
- \`draggable\` - Enable drag scrolling
- \`xadjustment\`, \`yadjustment\` - Adjustment objects`,
		category: 'statement'
	},
	"grid": {
		signature: "grid cols rows **properties",
		description: `A grid layout in a screen.

**Parameters:**
- \`cols\` - Number of columns
- \`rows\` - Number of rows

**Properties:**
- \`spacing\` - Space between cells
- \`transpose\` - Fill columns first instead of rows`,
		category: 'statement'
	},
	"fixed": {
		signature: "fixed **properties",
		description: `A container for absolutely positioned children.

Children should set their own positions using pos, xpos, ypos, align, etc.`,
		category: 'statement'
	},
	"side": {
		signature: "side layout **properties",
		description: `A container that positions children at sides and center.

**Parameters:**
- \`layout\` - A string like "c l r t b tl tr bl br" specifying which positions to use

**Positions:**
- \`c\` - center, \`l\` - left, \`r\` - right
- \`t\` - top, \`b\` - bottom
- \`tl\`, \`tr\`, \`bl\`, \`br\` - corners`,
		category: 'statement'
	},
	"input": {
		signature: "input **properties",
		description: `A text input field in a screen.

**Common properties:**
- \`default\` - Default text
- \`length\` - Maximum length
- \`pixel_width\` - Maximum pixel width
- \`allow\` - Allowed characters
- \`exclude\` - Excluded characters`,
		category: 'statement'
	},
	"key": {
		signature: "key keyname action=None",
		description: `Binds a key to an action.

**Parameters:**
- \`keyname\` - The key to bind (e.g., "K_ESCAPE", "K_RETURN")
- \`action\` - Action to perform when key is pressed`,
		category: 'statement'
	},
	"timer": {
		signature: "timer delay action=None repeat=False",
		description: `Creates a timer that triggers an action.

**Parameters:**
- \`delay\` - Time in seconds before triggering
- \`action\` - Action to perform
- \`repeat\` - If True, repeat the timer`,
		category: 'statement'
	},
	"on": {
		signature: "on event action=None",
		description: `Runs an action when an event occurs.

**Parameters:**
- \`event\` - Event name ("show", "hide", "replace", "replaced")
- \`action\` - Action to perform`,
		category: 'statement'
	},
	"default": {
		signature: "default variable = expression",
		description: `Declares a variable with a default value.

The variable is set to the expression only if it doesn't already have a value. This is evaluated at init time.

Example:
\`\`\`
default player_name = "Player"
default inventory = []
\`\`\``,
		category: 'statement'
	},
	"define": {
		signature: "define variable = expression",
		description: `Defines a constant variable.

The variable is set to the expression at init time and should not be changed during gameplay. Use for characters, transforms, styles, etc.

Example:
\`\`\`
define e = Character("Eileen")
define flash = Fade(0.1, 0.0, 0.5, color="#fff")
\`\`\``,
		category: 'statement'
	},
	"label": {
		signature: "label name(parameters):",
		description: `Defines a label that can be jumped or called to.

**Parameters:**
- \`name\` - The label name (used with jump/call)
- \`parameters\` - Optional parameters

Example:
\`\`\`
label start:
		"This is the beginning."

label greet(name="World"):
		"Hello, [name]!"
\`\`\``,
		category: 'statement'
	},
	"menu": {
		signature: "menu:",
		description: `Displays a menu of choices to the player.

Example:
\`\`\`
menu:
		"What do you want to do?"

		"Go left":
				jump left_path

		"Go right":
				jump right_path
\`\`\``,
		category: 'statement'
	},
	"jump": {
		signature: "jump label",
		description: `Jumps to a label, transferring control.

Unlike \`call\`, \`jump\` does not return.

Example:
\`\`\`
jump ending
jump expression "ending_" + ending_type
\`\`\``,
		category: 'statement'
	},
	"call": {
		signature: "call label(arguments) from label_name",
		description: `Calls a label, returning when the called label returns.

**Parameters:**
- \`label\` - The label to call
- \`arguments\` - Arguments to pass
- \`from\` - A unique identifier for the call site (required for rollback)

Example:
\`\`\`
call greeting("Eileen") from greeting_call
\`\`\``,
		category: 'statement'
	},
	"return": {
		signature: "return expression",
		description: `Returns from a call, optionally with a value.

If not in a call, returns to the main menu.

Example:
\`\`\`
return
return True
\`\`\``,
		category: 'statement'
	},
	"show": {
		signature: "show image_name at transform onlayer layer",
		description: `Shows an image on a layer.

**Parameters:**
- \`image_name\` - The image to show
- \`at\` - Transform(s) to apply
- \`onlayer\` - Layer to show on (default: "master")
- \`zorder\` - Z-order for stacking
- \`behind\` - Show behind another image
- \`as\` - Tag to use instead of image name

Example:
\`\`\`
show eileen happy at left
show bg park with dissolve
\`\`\``,
		category: 'statement'
	},
	"hide": {
		signature: "hide image_name onlayer layer",
		description: `Hides an image from a layer.

Example:
\`\`\`
hide eileen
hide eileen with dissolve
\`\`\``,
		category: 'statement'
	},
	"scene": {
		signature: "scene image_name onlayer layer",
		description: `Clears a layer and optionally shows a new image.

Example:
\`\`\`
scene bg bedroom
scene black with fade
\`\`\``,
		category: 'statement'
	},
	"with": {
		signature: "with transition",
		description: `Applies a transition to image changes.

Example:
\`\`\`
show eileen happy
with dissolve

# Or combined:
show eileen happy with dissolve
\`\`\``,
		category: 'statement'
	},
	"play": {
		signature: "play channel file",
		description: `Plays audio on a channel.

**Channels:** music, sound, voice, audio

**Options:**
- \`fadein\` - Fade in time
- \`fadeout\` - Fade out time for previous audio
- \`loop\` - Loop the audio
- \`if_changed\` - Only play if different

Example:
\`\`\`
play music "audio/theme.ogg"
play sound "audio/click.wav"
play music "audio/theme.ogg" fadein 1.0
\`\`\``,
		category: 'statement'
	},
	"stop": {
		signature: "stop channel",
		description: `Stops audio on a channel.

**Options:**
- \`fadeout\` - Fade out time

Example:
\`\`\`
stop music
stop music fadeout 1.0
\`\`\``,
		category: 'statement'
	},
	"queue": {
		signature: "queue channel file",
		description: `Queues audio to play after current audio ends.

Example:
\`\`\`
play music "track1.ogg"
queue music "track2.ogg"
\`\`\``,
		category: 'statement'
	},
	"pause": {
		signature: "pause seconds",
		description: `Pauses for a number of seconds, or until click.

Example:
\`\`\`
pause  # Wait for click
pause 2.0  # Wait 2 seconds
\`\`\``,
		category: 'statement'
	},
	"screen": {
		signature: "screen name(parameters):",
		description: `Defines a screen.

Screens are user interfaces defined using the screen language.

Example:
\`\`\`
screen hello_world():
		text "Hello, World!" align (0.5, 0.5)

screen inventory(items):
		vbox:
				for item in items:
						text item
\`\`\``,
		category: 'statement'
	},
	"transform": {
		signature: "transform name(parameters):",
		description: `Defines a transform using ATL.

Example:
\`\`\`
transform spin:
		rotate 0
		linear 1.0 rotate 360
		repeat

transform slide_in:
		xalign -0.5
		linear 0.5 xalign 0.0
\`\`\``,
		category: 'statement'
	},
	"image": {
		signature: "image name = displayable",
		description: `Defines an image.

Example:
\`\`\`
image bg sunset = "backgrounds/sunset.png"
image eileen happy = "characters/eileen_happy.png"
image composite = Composite(
		(800, 600),
		(0, 0), "background.png",
		(400, 300), "character.png"
)
\`\`\``,
		category: 'statement'
	},
	"style": {
		signature: "style name:",
		description: `Defines or modifies a style.

Example:
\`\`\`
style my_text:
		font "fonts/custom.ttf"
		size 24
		color "#ffffff"

style my_button is button:
		background "#333333"
		hover_background "#555555"
\`\`\``,
		category: 'statement'
	},
	"layeredimage": {
		signature: "layeredimage name:",
		description: `Defines a layered image with multiple attributes.

Example:
\`\`\`
layeredimage eileen:
		always:
				"eileen_base.png"

		group outfit:
				attribute casual default:
						"eileen_casual.png"
				attribute formal:
						"eileen_formal.png"

		group expression:
				attribute happy default:
						"eileen_happy.png"
				attribute sad:
						"eileen_sad.png"
\`\`\``,
		category: 'statement'
	},
	"nvl": {
		signature: "nvl",
		description: `Switches to NVL (novel) mode for dialogue display.

In NVL mode, dialogue accumulates on screen rather than replacing.

Example:
\`\`\`
nvl clear
n "This is NVL mode dialogue."
n "It accumulates on screen."
\`\`\``,
		category: 'statement'
	}
};

// Merge manual docs with generated docs (manual takes precedence for better descriptions)
const allDocs: Record<string, DocEntry> = { ...generatedDocs, ...renpyDocs };

// Get all doc entry names for completions
export function getAllSymbols(): string[] {
	return Object.keys(allDocs);
}

// Get documentation for a symbol
export function getDoc(symbol: string): DocEntry | undefined {
	return allDocs[symbol];
}

// Get entries by namespace (e.g., 'config', 'gui')
export function getEntriesByNamespace(namespace: string): string[] {
	return Object.keys(allDocs).filter(name => name.startsWith(namespace + '.'));
}
