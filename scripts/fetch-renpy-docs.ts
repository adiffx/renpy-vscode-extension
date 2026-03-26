#!/usr/bin/env npx ts-node

/**
 * Fetches Ren'Py documentation from GitHub and generates a JSON API definition file.
 *
 * Usage: npx ts-node scripts/fetch-renpy-docs.ts
 *
 * This parses RST files from the Ren'Py repository and extracts:
 * - config.* variables
 * - gui.* variables
 * - Screen actions (Jump, Show, SetVariable, etc.)
 * - Functions (renpy.*, etc.)
 * - Transforms and transitions
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/renpy/renpy/master/sphinx/source/';
const GITHUB_RAW_COMMON = 'https://raw.githubusercontent.com/renpy/renpy/master/renpy/common/';

// RST documentation files to parse
const RST_FILES = [
	'config.rst',
	'gui.rst',
	'build.rst',
	'transforms.rst',
	'transitions.rst',
	'style_properties.rst',
	'transform_properties.rst',
	'statement_equivalents.rst',  // renpy.say, renpy.pause, etc.
	'audio.rst',                   // renpy.play, renpy.music, etc.
	'save_load_rollback.rst',      // renpy.save, renpy.load, etc.
	'persistent.rst',              // persistent data
	'preferences.rst',             // preferences
	'other.rst',                   // misc renpy.* functions
	'screen_actions.rst',          // screen actions documentation
	'screens.rst',                 // screen language
	'text.rst',                    // text tags and functions
	'displayables.rst',            // displayable types
	'layeredimage.rst',            // layered images
	'model.rst',                   // model-based rendering
	'side_image.rst',              // side images
	'rooms.rst',                   // room system
	'drag_drop.rst',               // drag and drop
	'sprites.rst',                 // sprite system
	'cds.rst',                     // Creator-Defined Statements
	'cdd.rst',                     // Creator-Defined Displayables
];

// Ren'Py source files with action/class definitions (they have docstrings)
const RPY_SOURCE_FILES = [
	'00action_control.rpy',
	'00action_data.rpy',
	'00action_file.rpy',
	'00action_menu.rpy',
	'00action_audio.rpy',
	'00action_other.rpy',
];

interface ApiEntry {
	name: string;
	signature: string;
	description: string;
	category: 'variable' | 'function' | 'action' | 'class' | 'property' | 'transition';
	namespace?: string; // e.g., 'config', 'gui', 'renpy'
}

interface ApiData {
	version: string;
	generated: string;
	entries: ApiEntry[];
}

function fetchUrl(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		https.get(url, (res) => {
			if (res.statusCode === 301 || res.statusCode === 302) {
				// Follow redirect
				fetchUrl(res.headers.location!).then(resolve).catch(reject);
				return;
			}
			if (res.statusCode !== 200) {
				reject(new Error(`HTTP ${res.statusCode} for ${url}`));
				return;
			}
			let data = '';
			res.on('data', chunk => data += chunk);
			res.on('end', () => resolve(data));
			res.on('error', reject);
		}).on('error', reject);
	});
}

/**
 * Parse Ren'Py source files (.rpy) for class/action definitions with docstrings
 */
function parseRpyFile(content: string, filename: string): ApiEntry[] {
	const entries: ApiEntry[] = [];
	const lines = content.split('\n');

	let i = 0;
	while (i < lines.length) {
		const line = lines[i];

		// Match class definitions: class ClassName(Parent, ...):
		// or @decorator followed by class
		const classMatch = line.match(/^\s*class\s+([A-Z][a-zA-Z0-9_]*)\s*(?:\([^)]*\))?\s*:/);
		if (classMatch) {
			const className = classMatch[1];

			// Look for docstring on next lines
			let j = i + 1;
			// Skip empty lines
			while (j < lines.length && lines[j].trim() === '') j++;

			// Check for docstring
			if (j < lines.length && lines[j].includes('"""')) {
				const docstring = collectPythonDocstring(lines, j);
				if (docstring) {
					// Extract :args: directive if present
					const argsMatch = docstring.match(/:args:\s*\(([^)]+)\)/);
					const signature = argsMatch
						? `${className}(${argsMatch[1]})`
						: extractSignatureFromInit(lines, i, className);

					// Clean the description (remove :doc: and :args: directives)
					let description = docstring
						.replace(/:doc:\s*\w+\s*/g, '')
						.replace(/:args:\s*\([^)]+\)\s*/g, '')
						.trim();

					// Determine category
					let category: ApiEntry['category'] = 'class';
					if (className.endsWith('Action') || isActionName(className)) {
						category = 'action';
					} else if (isTransitionName(className)) {
						category = 'transition';
					}

					entries.push({
						name: className,
						signature,
						description,
						category
					});
				}
			}
		}

		i++;
	}

	return entries;
}

/**
 * Collect a Python docstring starting from a line with """
 */
function collectPythonDocstring(lines: string[], startIndex: number): string {
	let docLines: string[] = [];
	let i = startIndex;
	const firstLine = lines[i];

	// Check if it's a single-line docstring
	const singleLineMatch = firstLine.match(/"""\s*(.+?)\s*"""/);
	if (singleLineMatch) {
		return singleLineMatch[1];
	}

	// Multi-line docstring
	const openMatch = firstLine.match(/"""\s*(.*)/);
	if (!openMatch) return '';

	if (openMatch[1]) {
		docLines.push(openMatch[1]);
	}

	i++;
	while (i < lines.length) {
		const line = lines[i];
		if (line.includes('"""')) {
			// End of docstring
			const closeMatch = line.match(/(.*?)"""/);
			if (closeMatch && closeMatch[1].trim()) {
				docLines.push(closeMatch[1]);
			}
			break;
		}
		docLines.push(line);
		i++;
	}

	// Clean up indentation
	const result = docLines
		.map(l => l.replace(/^\s{4,8}/, ''))
		.join('\n')
		.trim();

	return result;
}

/**
 * Try to extract signature from __init__ method
 */
function extractSignatureFromInit(lines: string[], classLineIndex: number, className: string): string {
	// Look for __init__ in the next ~30 lines
	for (let i = classLineIndex + 1; i < Math.min(classLineIndex + 30, lines.length); i++) {
		const line = lines[i];
		// Stop if we hit another class definition
		if (line.match(/^\s*class\s+[A-Z]/)) break;

		const initMatch = line.match(/def\s+__init__\s*\(\s*self\s*,?\s*([^)]*)\)/);
		if (initMatch) {
			const params = initMatch[1].trim();
			return params ? `${className}(${params})` : `${className}()`;
		}
	}
	return `${className}()`;
}

function parseRstFile(content: string, filename: string): ApiEntry[] {
	const entries: ApiEntry[] = [];
	const lines = content.split('\n');

	let i = 0;
	while (i < lines.length) {
		const line = lines[i];

		// Match variable definitions: .. var:: config.name = value
		const varMatch = line.match(/^\.\.\s+var::\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s*(?:=\s*(.+))?$/);
		if (varMatch) {
			const fullName = varMatch[1];
			const defaultValue = varMatch[2] || '';
			const description = collectDescription(lines, i + 1);

			// Determine namespace
			let namespace: string | undefined;
			let name = fullName;
			if (fullName.startsWith('config.')) {
				namespace = 'config';
				name = fullName;
			} else if (fullName.startsWith('gui.')) {
				namespace = 'gui';
				name = fullName;
			} else if (fullName.startsWith('build.')) {
				namespace = 'build';
				name = fullName;
			}

			entries.push({
				name: fullName,
				signature: defaultValue ? `${fullName} = ${defaultValue}` : fullName,
				description: description,
				category: 'variable',
				namespace
			});
			i++;
			continue;
		}

		// Match function definitions: .. function:: renpy.pause(delay=None, hard=False)
		const funcMatch = line.match(/^\.\.\s+function::\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s*\(([^)]*)\)/);
		if (funcMatch) {
			const fullName = funcMatch[1];
			const params = funcMatch[2];
			const description = collectDescription(lines, i + 1);

			let namespace: string | undefined;
			if (fullName.startsWith('renpy.')) {
				namespace = 'renpy';
			}

			entries.push({
				name: fullName,
				signature: `${fullName}(${params})`,
				description: description,
				category: 'function',
				namespace
			});
			i++;
			continue;
		}

		// Match class definitions: .. class:: Dissolve(time, alpha=False, time_warp=None)
		const classMatch = line.match(/^\.\.\s+class::\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s*(?:\(([^)]*)\))?/);
		if (classMatch) {
			const fullName = classMatch[1];
			const params = classMatch[2] || '';
			const description = collectDescription(lines, i + 1);

			// Determine category based on context
			let category: ApiEntry['category'] = 'class';
			if (filename.includes('transition') || isTransitionName(fullName)) {
				category = 'transition';
			} else if (filename.includes('action') || isActionName(fullName)) {
				category = 'action';
			}

			entries.push({
				name: fullName,
				signature: params ? `${fullName}(${params})` : fullName,
				description: description,
				category
			});
			i++;
			continue;
		}

		// Match style/transform properties: .. style-property:: background
		const propMatch = line.match(/^\.\.\s+(?:style-property|transform-property)::\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
		if (propMatch) {
			const name = propMatch[1];
			const description = collectDescription(lines, i + 1);

			entries.push({
				name,
				signature: name,
				description,
				category: 'property'
			});
			i++;
			continue;
		}

		i++;
	}

	// Second pass: extract :var:`namespace.name` definition list items
	// Format: ":var:`gui.show_name`" at start of line, followed by indented description
	for (let j = 0; j < lines.length; j++) {
		const line = lines[j];
		const defListMatch = line.match(/^:var:`((?:gui|config|build|renpy)\.[a-zA-Z_][a-zA-Z0-9_]*)`\s*$/);
		if (defListMatch) {
			const fullName = defListMatch[1];

			// Only add if not already found via .. var:: directive
			if (!entries.some(e => e.name === fullName)) {
				// Collect the indented description that follows
				const description = collectDescription(lines, j + 1);

				let namespace: string | undefined;
				if (fullName.startsWith('config.')) namespace = 'config';
				else if (fullName.startsWith('gui.')) namespace = 'gui';
				else if (fullName.startsWith('build.')) namespace = 'build';
				else if (fullName.startsWith('renpy.')) namespace = 'renpy';

				entries.push({
					name: fullName,
					signature: fullName,
					description: description,
					category: 'variable',
					namespace
				});
			}
		}
	}

	return entries;
}

function collectDescription(lines: string[], startIndex: number): string {
	const descLines: string[] = [];
	let i = startIndex;

	// Skip empty lines
	while (i < lines.length && lines[i].trim() === '') {
		i++;
	}

	// Collect indented description lines
	while (i < lines.length) {
		const line = lines[i];

		// Stop at next directive or non-indented line
		if (line.match(/^\.\.\s+\w+::/)) {
			break;
		}
		if (line.trim() !== '' && !line.startsWith('    ') && !line.startsWith('\t')) {
			break;
		}

		// Add the line (removing leading whitespace)
		const trimmed = line.replace(/^    /, '').replace(/^\t/, '');
		descLines.push(trimmed);
		i++;
	}

	// Clean up the description
	let desc = descLines.join('\n').trim();

	// Convert RST formatting to plain text/markdown
	desc = desc
		// Remove RST cross-references like :func:`renpy.pause`
		.replace(/:(?:func|class|var|ref|doc|term|attr|meth|exc|data|const|obj|mod|keyword|option|envvar|token|grammar-token|index|any|role|numref|eq|download|hoverxref|py:func|py:class|py:meth|py:attr|py:obj|py:exc|py:data|py:const|py:mod)`([^`]+)`/g, '`$1`')
		// Remove remaining RST roles
		.replace(/:[a-z]+:`([^`]+)`/g, '`$1`')
		// Convert RST literals ``code`` to markdown `code`
		.replace(/``([^`]+)``/g, '`$1`')
		// Remove RST note/warning directives but keep content
		.replace(/^\.\.\s+(note|warning|tip|important|seealso)::\s*/gm, '\n**Note:** ')
		// Clean up multiple newlines
		.replace(/\n{3,}/g, '\n\n');

	return desc;
}

function isTransitionName(name: string): boolean {
	const transitionNames = [
		'Dissolve', 'Fade', 'ImageDissolve', 'AlphaDissolve', 'CropMove',
		'PushMove', 'MoveTransition', 'MoveFactory', 'MoveIn', 'MoveOut',
		'Pixellate', 'Swing', 'Zoom', 'ZoomInOut'
	];
	return transitionNames.some(t => name.includes(t));
}

function isActionName(name: string): boolean {
	const actionPatterns = [
		'Action', 'Jump', 'Call', 'Show', 'Hide', 'Return', 'Set', 'Toggle',
		'Play', 'Stop', 'Queue', 'Mute', 'File', 'Preference', 'Quit', 'Start',
		'Rollback', 'Notify', 'Confirm', 'If', 'Screenshot', 'Skip', 'Auto',
		'Menu', 'Replay', 'End', 'Mouse', 'Open', 'Null'
	];
	return actionPatterns.some(p => name.includes(p));
}

async function main() {
	console.log('Fetching Ren\'Py documentation from GitHub...\n');
	console.log('This script fetches documentation from the Ren\'Py repository');
	console.log('and generates a JSON API definition file for the extension.\n');

	const allEntries: ApiEntry[] = [];

	// Fetch RST documentation files
	console.log('=== RST Documentation Files ===');
	for (const filename of RST_FILES) {
		const url = GITHUB_RAW_BASE + filename;
		console.log(`Fetching ${filename}...`);

		try {
			const content = await fetchUrl(url);
			const entries = parseRstFile(content, filename);
			console.log(`  Found ${entries.length} entries`);
			allEntries.push(...entries);
		} catch (error) {
			console.error(`  Error fetching ${filename}:`, error);
		}
	}

	// Fetch Ren'Py source files for actions
	console.log('\n=== Ren\'Py Source Files (Actions) ===');
	for (const filename of RPY_SOURCE_FILES) {
		const url = GITHUB_RAW_COMMON + filename;
		console.log(`Fetching ${filename}...`);

		try {
			const content = await fetchUrl(url);
			const entries = parseRpyFile(content, filename);
			console.log(`  Found ${entries.length} entries`);
			allEntries.push(...entries);
		} catch (error) {
			console.error(`  Error fetching ${filename}:`, error);
		}
	}

	// Remove duplicates by name
	const uniqueEntries = new Map<string, ApiEntry>();
	for (const entry of allEntries) {
		// Keep the first occurrence (or merge if needed)
		if (!uniqueEntries.has(entry.name)) {
			uniqueEntries.set(entry.name, entry);
		}
	}

	const apiData: ApiData = {
		version: '8.3.0', // Ren'Py version this was generated from
		generated: new Date().toISOString(),
		entries: Array.from(uniqueEntries.values())
	};

	// Write to file
	const outputPath = path.join(__dirname, '..', 'src', 'server', 'renpy-api.json');
	fs.writeFileSync(outputPath, JSON.stringify(apiData, null, 2));

	console.log(`\nGenerated ${apiData.entries.length} unique entries`);
	console.log(`Output written to: ${outputPath}`);

	// Print summary by category
	const byCategory = new Map<string, number>();
	for (const entry of apiData.entries) {
		byCategory.set(entry.category, (byCategory.get(entry.category) || 0) + 1);
	}
	console.log('\nBy category:');
	for (const [cat, count] of byCategory) {
		console.log(`  ${cat}: ${count}`);
	}

	// Print summary by namespace
	const byNamespace = new Map<string, number>();
	for (const entry of apiData.entries) {
		const ns = entry.namespace || '(none)';
		byNamespace.set(ns, (byNamespace.get(ns) || 0) + 1);
	}
	console.log('\nBy namespace:');
	for (const [ns, count] of byNamespace) {
		console.log(`  ${ns}: ${count}`);
	}
}

main().catch(console.error);
