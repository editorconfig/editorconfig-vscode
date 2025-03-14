import * as assert from 'assert'
import * as path from 'path'
import { commands, window } from 'vscode'
import { wait } from '../testUtils'

import * as utils from 'vscode-test-utils'

suite('indentation settings', function () {
	this.retries(0)
	this.timeout(7000)
	suiteTeardown(utils.closeAllFiles)

	const editorconfigPath = path.resolve(path.join(__dirname, '.editorconfig'))
	const vscodeSettingsPath = path.resolve(
		path.join(__dirname, '.vscode/settings.json'),
	)

	test('can handle tabs & spaces options', async function () {
		const scenarios = [
			{
				config: {
					indent_style: 'tab',
					indent_size: 5,
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					insertSpaces: false,
					tabSize: 5,
					indentSize: 5,
				},
			},
			{
				config: {
					indent_style: 'tab',
					tab_width: 5,
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					insertSpaces: false,
					tabSize: 5,
					indentSize: 5,
				},
			},
			{
				config: {
					indent_style: 'space',
					indent_size: 5,
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					insertSpaces: true,
					tabSize: 5,
					indentSize: 5,
				},
			},
			{
				config: {
					indent_size: 5,
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					insertSpaces: false,
					tabSize: 5,
					indentSize: 5,
				},
			},
			{
				config: {
					tab_width: 5,
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					tabSize: 5,
				},
			},
			{
				config: {
					indent_size: 5,
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: true,
					tabSize: 4,
				},
				expected: {
					insertSpaces: true,
					tabSize: 5,
					indentSize: 5,
				},
			},
			{
				config: {
					tab_width: 5,
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: true,
					tabSize: 4,
				},
				expected: {
					tabSize: 5,
				},
			},
			{
				config: {
					indent_style: 'space',
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					insertSpaces: true,
					tabSize: 4,
				},
			},
			{
				config: {
					indent_style: 'space',
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: false,
					tabSize: 5,
				},
				expected: {
					insertSpaces: true,
					tabSize: 5,
				},
			},
			{
				config: {
					indent_size: 'tab',
					tab_width: 3,
				},
				defaults: {
					detectIndentation: false,
					insertSpaces: false,
					tabSize: 5,
				},
				expected: {
					insertSpaces: false,
					tabSize: 3,
					indentSize: 3,
				},
			},
			{
				config: {},
				defaults: {
					detectIndentation: false,
					insertSpaces: false,
					tabSize: 5,
				},
				expected: {
					insertSpaces: false,
					tabSize: 5,
				},
			},
			{
				config: {},
				defaults: {
					detectIndentation: false,
					insertSpaces: true,
					tabSize: 4,
				},
				expected: {
					insertSpaces: true,
					tabSize: 4,
				},
			},
			{
				config: {
					indent_size: 2,
					indent_style: 'space',
					tab_width: 4,
				},
				defaults: { detectIndentation: false },
				expected: {
					insertSpaces: true,
					tabSize: 4,
					indentSize: 2,
				},
			},
		]

		for (const scenario of scenarios) {
			const settings = Object.entries(scenario.defaults).reduce(
				(
					acc: Record<string, string | number | boolean | undefined>,
					[key, value],
				) => {
					acc[`editor.${key}`] = value
					return acc
				},
				{},
			)
			await utils.createFile(JSON.stringify(settings), vscodeSettingsPath)

			const editorconfig = `root = true\n[*]\n
			${Object.entries(scenario.config)
				.map(([key, value]) => `${key} = ${value}`)
				.join('\n')}`
			await utils.createFile(editorconfig, editorconfigPath)

			await wait(400)
			await commands.executeCommand('workbench.action.files.newUntitledFile')

			const { activeTextEditor } = window
			assert.ok(activeTextEditor, 'no active editor')
			for (const [key, expectedValue] of Object.entries(scenario.expected)) {
				const typedKey = key as keyof typeof scenario.expected
				assert.strictEqual(
					activeTextEditor.options[typedKey],
					expectedValue,
					`editor option "${key}" is ${JSON.stringify(activeTextEditor.options[typedKey])} instead of ${JSON.stringify(expectedValue)}\nexpected: ${JSON.stringify(scenario.expected)}\nactual: ${JSON.stringify(activeTextEditor.options)}`,
				)
			}

			await commands.executeCommand('workbench.action.closeActiveEditor')
		}
	})
})
