import * as assert from 'assert'
import { KnownProps } from 'editorconfig'
import { TextEditorOptions } from 'vscode'

import * as api from '../../api'

suite('EditorConfig extension', () => {
	// Defines a Mocha unit test
	test('api.fromEditorConfig', () => {
		const scenarios: {
			config: KnownProps
			defaults: TextEditorOptions
			expected: TextEditorOptions
		}[] = [
			{
				config: {
					indent_style: 'tab',
					indent_size: 5,
				},
				defaults: {
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
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					insertSpaces: false,
					tabSize: 5,
				},
			},
			{
				config: {
					indent_style: 'space',
					indent_size: 5,
				},
				defaults: {
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					insertSpaces: true,
					tabSize: 4,
					indentSize: 5,
				},
			},
			{
				config: {
					indent_size: 5,
				},
				defaults: {
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					insertSpaces: false,
					tabSize: 4,
					indentSize: 5,
				},
			},
			{
				config: {
					tab_width: 5,
				},
				defaults: {
					insertSpaces: false,
					tabSize: 4,
				},
				expected: {
					insertSpaces: false,
					tabSize: 5,
				},
			},
			{
				config: {
					indent_size: 5,
				},
				defaults: {
					insertSpaces: true,
					tabSize: 4,
				},
				expected: {
					insertSpaces: true,
					tabSize: 4,
					indentSize: 5,
				},
			},
			{
				config: {
					tab_width: 5,
				},
				defaults: {
					insertSpaces: true,
					tabSize: 4,
				},
				expected: {
					insertSpaces: true,
					tabSize: 5,
				},
			},
			{
				config: {
					indent_style: 'space',
				},
				defaults: {
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
					insertSpaces: false,
					tabSize: 5,
				},
				expected: {
					insertSpaces: false,
					tabSize: 3,
					indentSize: 'tabSize',
				},
			},
			{
				config: {},
				defaults: {
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
				defaults: {},
				expected: {
					insertSpaces: true,
					tabSize: 4,
					indentSize: 2,
				},
			},
			{
				config: {
					indent_style: 'tab',
					indent_size: 8,
					tab_width: 'unset',
				},
				defaults: {
					tabSize: 2,
				},
				expected: {
					insertSpaces: false,
					indentSize: 8,
					tabSize: 2,
				},
			},
		]
		scenarios.forEach(scenario => {
			assert.deepStrictEqual(
				api.fromEditorConfig(scenario.config, scenario.defaults),
				scenario.expected,
			)
		})
	})

	test('api.toEditorConfig', () => {
		const scenarios: {
			options: TextEditorOptions
			expected: KnownProps
		}[] = [
			{
				options: {
					insertSpaces: true,
					tabSize: 5,
				},
				expected: {
					indent_style: 'space',
					indent_size: 5,
				},
			},
			{
				options: {
					insertSpaces: false,
					tabSize: 6,
				},
				expected: {
					indent_style: 'tab',
					tab_width: 6,
				},
			},
			{
				options: {
					insertSpaces: false,
					tabSize: 'auto',
				},
				expected: {
					indent_style: 'tab',
					tab_width: 4,
				},
			},
			{
				options: {
					insertSpaces: 'auto',
					tabSize: 7,
				},
				expected: {
					indent_style: 'tab',
					tab_width: 7,
				},
			},
			{
				options: {
					insertSpaces: 'auto',
					tabSize: 'auto',
				},
				expected: {
					indent_style: 'tab',
					tab_width: 4,
				},
			},
		]
		scenarios.forEach(scenario => {
			assert.deepStrictEqual(
				api.toEditorConfig(scenario.options),
				scenario.expected,
			)
		})
	})
})
