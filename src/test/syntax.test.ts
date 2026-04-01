// Tests for syntax highlighting patterns from renpy.tmLanguage.json

describe('String Tag Pattern', () => {
	const tagRegex = /\{[^}]*\}/g;

	it('should match simple tags', () => {
		const matches = '{b}bold text{/b}'.match(tagRegex);
		expect(matches).toEqual(['{b}', '{/b}']);
	});

	it('should match tags with attributes', () => {
		const matches = '{size=+10}Chapter 5{/size}'.match(tagRegex);
		expect(matches).toEqual(['{size=+10}', '{/size}']);
	});

	it('should match color tags', () => {
		const matches = '{color=#ff0000}red{/color}'.match(tagRegex);
		expect(matches).toEqual(['{color=#ff0000}', '{/color}']);
	});

	it('should match multiple tags in one string', () => {
		const text = '{b}{i}bold italic{/i}{/b}';
		const matches = text.match(tagRegex);
		expect(matches).toEqual(['{b}', '{i}', '{/i}', '{/b}']);
	});

	it('should match self-closing tags', () => {
		const matches = 'line one{n}line two'.match(tagRegex);
		expect(matches).toEqual(['{n}']);
	});
});

describe('String Interpolation Pattern', () => {
	// Simple non-recursive regex for basic interpolation
	const simpleInterpolationRegex = /\[[^\[\]]*\]/g;

	it('should match simple variable interpolation', () => {
		const matches = 'Hello [player_name]!'.match(simpleInterpolationRegex);
		expect(matches).toEqual(['[player_name]']);
	});

	it('should match multiple interpolations', () => {
		const matches = '[greeting] [player_name]!'.match(simpleInterpolationRegex);
		expect(matches).toEqual(['[greeting]', '[player_name]']);
	});

	it('should match expression interpolation', () => {
		const matches = 'Score: [score * 10]'.match(simpleInterpolationRegex);
		expect(matches).toEqual(['[score * 10]']);
	});
});

describe('Nested Interpolation (tmLanguage begin/end)', () => {
	// The tmLanguage uses recursive begin/end for nested brackets.
	// We simulate the nesting detection here.
	function findInterpolationBrackets(text: string): Array<{ start: number; end: number; depth: number }> {
		const brackets: Array<{ start: number; end: number; depth: number }> = [];
		const stack: number[] = [];

		for (let i = 0; i < text.length; i++) {
			if (text[i] === '[') {
				stack.push(i);
			} else if (text[i] === ']' && stack.length > 0) {
				const start = stack.pop()!;
				brackets.push({ start, end: i, depth: stack.length });
			}
		}
		return brackets.sort((a, b) => a.start - b.start);
	}

	it('should handle simple interpolation', () => {
		const brackets = findInterpolationBrackets('[player_name]');
		expect(brackets).toHaveLength(1);
		expect(brackets[0]).toEqual({ start: 0, end: 12, depth: 0 });
	});

	it('should handle nested brackets like [CHAPTER_SUBTITLES[5]]', () => {
		const brackets = findInterpolationBrackets('[CHAPTER_SUBTITLES[5]]');
		expect(brackets).toHaveLength(2);
		// Sorted by start: outer [0..21] comes before inner [18..20]
		expect(brackets[0]).toEqual({ start: 0, end: 21, depth: 0 });
		expect(brackets[1]).toEqual({ start: 18, end: 20, depth: 1 });
	});

	it('should handle complex nested expression', () => {
		const brackets = findInterpolationBrackets('[items[index]]');
		expect(brackets).toHaveLength(2);
		// Sorted by start: outer [0..13] comes before inner [6..12]
		expect(brackets[0]).toEqual({ start: 0, end: 13, depth: 0 });
		expect(brackets[1]).toEqual({ start: 6, end: 12, depth: 1 });
	});

	it('should handle multiple top-level interpolations', () => {
		const brackets = findInterpolationBrackets('[a] and [b]');
		expect(brackets).toHaveLength(2);
		expect(brackets[0].depth).toBe(0);
		expect(brackets[1].depth).toBe(0);
	});
});

describe('Combined Tags and Interpolation in Dialogue', () => {
	const tagRegex = /\{[^}]*\}/g;

	it('should parse centered dialogue with tags and nested interpolation', () => {
		const text = '{size=+10}Chapter [chapter_num]{/size}\\n[CHAPTER_SUBTITLES[5]]';

		// Tags should be found
		const tags = text.match(tagRegex);
		expect(tags).toEqual(['{size=+10}', '{/size}']);

		// Remove tags to see interpolation clearly
		const withoutTags = text.replace(tagRegex, '');
		expect(withoutTags).toBe('Chapter [chapter_num]\\n[CHAPTER_SUBTITLES[5]]');
	});

	it('should handle tags with interpolation inside', () => {
		const text = '{color=[player_color]}Hello{/color}';
		const tags = text.match(tagRegex);
		// The tag regex stops at first }, so it captures {color=[player_color]}
		expect(tags).toEqual(['{color=[player_color]}', '{/color}']);
	});
});

describe('Keyword Highlighting', () => {
	const keywordRegex = /\b(label|menu|if|elif|else|while|for|jump|call|return|pass|screen|transform|image|define|default|init|python|style|layeredimage|show|hide|scene|with|play|stop|queue|pause|nvl|window|frame|text|textbutton|imagebutton|button|vbox|hbox|grid|fixed|side|viewport|use|transclude|on|action|has|at|as|behind|onlayer|zorder|expression|centered|extend)\b/;

	it('should match centered as a keyword', () => {
		expect(keywordRegex.test('centered')).toBe(true);
		expect(keywordRegex.test('    centered "{size=+10}Chapter 5{/size}"')).toBe(true);
	});

	it('should match extend as a keyword', () => {
		expect(keywordRegex.test('extend')).toBe(true);
		expect(keywordRegex.test('    extend " more text"')).toBe(true);
	});

	it('should not match partial keywords', () => {
		expect(keywordRegex.test('centered_text')).toBe(false);
		expect(keywordRegex.test('mycall')).toBe(false);
	});
});

describe('Say Statement Pattern', () => {
	// The begin pattern from the tmLanguage for say statements
	const sayBeginRegex = /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s+(")/;

	it('should match character dialogue', () => {
		const match = '    e "Hello world"'.match(sayBeginRegex);
		expect(match).not.toBeNull();
		expect(match![2]).toBe('e');
	});

	it('should match character with tags in dialogue', () => {
		const match = '    e "{b}Hello{/b} world"'.match(sayBeginRegex);
		expect(match).not.toBeNull();
		expect(match![2]).toBe('e');
	});

	it('should match character with interpolation in dialogue', () => {
		const match = '    narrator "Welcome, [player_name]!"'.match(sayBeginRegex);
		expect(match).not.toBeNull();
		expect(match![2]).toBe('narrator');
	});
});
