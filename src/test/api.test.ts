// Tests for the generated API data

import * as fs from 'fs';
import * as path from 'path';

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

// Load the API data
const apiPath = path.join(__dirname, '..', 'server', 'renpy-api.json');
let apiData: ApiData | null = null;

beforeAll(() => {
	if (fs.existsSync(apiPath)) {
		apiData = JSON.parse(fs.readFileSync(apiPath, 'utf-8'));
	}
});

describe('API Data Structure', () => {
	it('should load the API file', () => {
		expect(apiData).not.toBeNull();
	});

	it('should have version and generated fields', () => {
		expect(apiData!.version).toBeDefined();
		expect(apiData!.generated).toBeDefined();
	});

	it('should have entries array', () => {
		expect(Array.isArray(apiData!.entries)).toBe(true);
		expect(apiData!.entries.length).toBeGreaterThan(0);
	});

	it('should have required fields for each entry', () => {
		for (const entry of apiData!.entries.slice(0, 10)) {
			expect(entry.name).toBeDefined();
			expect(typeof entry.name).toBe('string');
			expect(entry.signature).toBeDefined();
			expect(entry.description).toBeDefined();
			expect(entry.category).toBeDefined();
		}
	});
});

describe('Config Namespace', () => {
	let configEntries: ApiEntry[];

	beforeAll(() => {
		configEntries = apiData!.entries.filter(e => e.namespace === 'config');
	});

	it('should have config entries', () => {
		expect(configEntries.length).toBeGreaterThan(100);
	});

	it('should have config.name', () => {
		const entry = configEntries.find(e => e.name === 'config.name');
		expect(entry).toBeDefined();
		expect(entry!.category).toBe('variable');
	});

	it('should have config.version', () => {
		const entry = configEntries.find(e => e.name === 'config.version');
		expect(entry).toBeDefined();
	});

	it('should have config.screen_width', () => {
		const entry = configEntries.find(e => e.name === 'config.screen_width');
		expect(entry).toBeDefined();
	});

	it('all config entries should start with config.', () => {
		for (const entry of configEntries) {
			expect(entry.name.startsWith('config.')).toBe(true);
		}
	});
});

describe('GUI Namespace', () => {
	let guiEntries: ApiEntry[];

	beforeAll(() => {
		guiEntries = apiData!.entries.filter(e => e.namespace === 'gui');
	});

	it('should have gui entries', () => {
		expect(guiEntries.length).toBeGreaterThan(50);
	});

	it('should have gui.text_color', () => {
		const entry = guiEntries.find(e => e.name === 'gui.text_color');
		expect(entry).toBeDefined();
	});

	it('should have gui.show_name (from definition list format)', () => {
		const entry = guiEntries.find(e => e.name === 'gui.show_name');
		expect(entry).toBeDefined();
		expect(entry!.description).toContain('False');
	});

	it('all gui entries should start with gui.', () => {
		for (const entry of guiEntries) {
			expect(entry.name.startsWith('gui.')).toBe(true);
		}
	});
});

describe('Build Namespace', () => {
	let buildEntries: ApiEntry[];

	beforeAll(() => {
		buildEntries = apiData!.entries.filter(e => e.namespace === 'build');
	});

	it('should have build entries', () => {
		expect(buildEntries.length).toBeGreaterThan(10);
	});

	it('should have build.name', () => {
		const entry = buildEntries.find(e => e.name === 'build.name');
		expect(entry).toBeDefined();
	});

	it('should have build.directory_name', () => {
		const entry = buildEntries.find(e => e.name === 'build.directory_name');
		expect(entry).toBeDefined();
	});
});

describe('Actions', () => {
	let actionEntries: ApiEntry[];

	beforeAll(() => {
		actionEntries = apiData!.entries.filter(e => e.category === 'action');
	});

	it('should have action entries', () => {
		expect(actionEntries.length).toBeGreaterThan(20);
	});

	it('should have Jump action', () => {
		const entry = actionEntries.find(e => e.name === 'Jump');
		expect(entry).toBeDefined();
	});

	it('should have Call action', () => {
		const entry = actionEntries.find(e => e.name === 'Call');
		expect(entry).toBeDefined();
	});

	it('should have Set action', () => {
		const entry = actionEntries.find(e => e.name === 'Set');
		expect(entry).toBeDefined();
	});

	it('should have Show action', () => {
		const entry = actionEntries.find(e => e.name === 'Show');
		expect(entry).toBeDefined();
	});

	it('should have Play action', () => {
		const entry = actionEntries.find(e => e.name === 'Play');
		expect(entry).toBeDefined();
	});
});

describe('Properties', () => {
	let propertyEntries: ApiEntry[];

	beforeAll(() => {
		propertyEntries = apiData!.entries.filter(e => e.category === 'property');
	});

	it('should have property entries', () => {
		expect(propertyEntries.length).toBeGreaterThan(100);
	});

	it('should have style properties like background', () => {
		const entry = propertyEntries.find(e => e.name === 'background');
		expect(entry).toBeDefined();
	});

	it('should have transform properties like xpos', () => {
		const entry = propertyEntries.find(e => e.name === 'xpos');
		expect(entry).toBeDefined();
	});

	it('should have transform properties like alpha', () => {
		const entry = propertyEntries.find(e => e.name === 'alpha');
		expect(entry).toBeDefined();
	});
});

describe('Transitions and Transform Classes', () => {
	let classEntries: ApiEntry[];

	beforeAll(() => {
		classEntries = apiData!.entries.filter(e => e.category === 'class');
	});

	it('should have Transform class', () => {
		const entry = classEntries.find(e => e.name === 'Transform');
		expect(entry).toBeDefined();
	});

	it('should have With class (for transitions)', () => {
		const entry = classEntries.find(e => e.name === 'With');
		expect(entry).toBeDefined();
	});

	it('should have Function class', () => {
		const entry = classEntries.find(e => e.name === 'Function');
		expect(entry).toBeDefined();
	});
});

describe('Classes', () => {
	let classEntries: ApiEntry[];

	beforeAll(() => {
		classEntries = apiData!.entries.filter(e => e.category === 'class');
	});

	it('should have class entries', () => {
		expect(classEntries.length).toBeGreaterThan(5);
	});
});

describe('Entry Descriptions', () => {
	it('config entries should have meaningful descriptions', () => {
		const entry = apiData!.entries.find(e => e.name === 'config.name');
		expect(entry).toBeDefined();
		expect(entry!.description.length).toBeGreaterThan(20);
	});

	it('action entries should have descriptions', () => {
		const entry = apiData!.entries.find(e => e.name === 'Jump');
		expect(entry).toBeDefined();
		expect(entry!.description.length).toBeGreaterThan(10);
	});

	it('descriptions should not contain raw RST directives', () => {
		for (const entry of apiData!.entries.slice(0, 50)) {
			expect(entry.description).not.toMatch(/^\.\.\s+\w+::/);
		}
	});
});

describe('Entry Signatures', () => {
	it('config entries should have signature with variable name', () => {
		const entry = apiData!.entries.find(e => e.name === 'config.name');
		expect(entry).toBeDefined();
		expect(entry!.signature).toContain('config.name');
	});

	it('action entries should have callable signature', () => {
		const entry = apiData!.entries.find(e => e.name === 'Jump');
		expect(entry).toBeDefined();
		expect(entry!.signature).toContain('Jump');
		expect(entry!.signature).toContain('(');
	});

	it('class entries should have callable signature', () => {
		const entry = apiData!.entries.find(e => e.name === 'Transform');
		expect(entry).toBeDefined();
		expect(entry!.signature).toContain('Transform');
	});
});
