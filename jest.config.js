/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/src/test/**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js'],
};
