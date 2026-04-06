export const INLINE_COMMENT_DIAGNOSTIC_CODE = 'inline-comment'
export const INLINE_COMMENT_DIAGNOSTIC_MESSAGE =
	'Inline comments are not supported in EditorConfig. Move this comment to its own line.'

/**
 * Matches an inline comment: any line that contains non-whitespace content
 * followed by required whitespace and then an unquoted `#` or `;`.
 * Lines where `#` or `;` is the first non-whitespace character are proper
 * standalone comments and are excluded before this regex is applied.
 *
 * This mirrors the `inlineComment` rule in syntaxes/editorconfig.tmLanguage.json
 * (`invalid.illegal.inline-comment.editorconfig`). Unfortunately VS Code's
 * extension API does not expose TextMate token scopes at runtime, so the
 * detection must be re-implemented here in TypeScript.
 */
const INLINE_COMMENT_RE = /\S.*?([ \t]+)([#;].*)$/

export type InlineCommentMatch = {
	indentation: string
	commentStart: number
	separatorStart: number
	commentText: string
}

export function findInlineComment(text: string): InlineCommentMatch | undefined {
	const trimmed = text.trimStart()
	if (
		trimmed.length === 0 ||
		trimmed.startsWith('#') ||
		trimmed.startsWith(';')
	) {
		return
	}

	const match = INLINE_COMMENT_RE.exec(text)
	if (!match) {
		return
	}

	const commentText = match[2]
	const commentStart = text.length - commentText.length
	const separatorStart = commentStart - match[1].length
	const indentation = text.match(/^\s*/)?.[0] ?? ''

	return {
		indentation,
		commentStart,
		separatorStart,
		commentText,
	}
}

export function moveInlineCommentToOwnLine(text: string, eol: string) {
	const inlineComment = findInlineComment(text)
	if (!inlineComment) {
		return
	}

	return `${text.slice(0, inlineComment.separatorStart)}${eol}${inlineComment.indentation}${inlineComment.commentText}`
}
