import * as assert from 'assert'
import {
	findInlineComment,
	moveInlineCommentToOwnLine,
} from '../inlineComments'

suite('inline comment helpers', () => {
	test('ignores standalone comments', () => {
		assert.strictEqual(findInlineComment('   # already valid comment'), undefined)
	})

	test('moves property inline comments onto a new line', () => {
		assert.strictEqual(
			moveInlineCommentToOwnLine('  indent_style = space # required', '\n'),
			'  indent_style = space\n  # required',
		)
	})

	test('moves section inline comments onto a new line', () => {
		assert.strictEqual(
			moveInlineCommentToOwnLine('[*.md] ; note', '\n'),
			'[*.md]\n; note',
		)
	})
})
