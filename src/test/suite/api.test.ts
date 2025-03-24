import * as assert from 'assert'

import * as api from '../../api'

suite('EditorConfig extension', () => {
	test('api.toEditorConfig', () => {
		;[
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
		].forEach(scenario => {
			assert.deepStrictEqual(
				api.toEditorConfig(scenario.options),
				scenario.expected,
			)
		})
	})
})
