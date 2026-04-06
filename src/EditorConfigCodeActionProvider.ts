import {
	CodeAction,
	CodeActionContext,
	CodeActionKind,
	CodeActionProvider,
	Diagnostic,
	EndOfLine,
	Range,
	Selection,
	TextDocument,
	WorkspaceEdit,
} from 'vscode'
import {
	INLINE_COMMENT_DIAGNOSTIC_CODE,
	moveInlineCommentToOwnLine,
} from './inlineComments'

const MOVE_INLINE_COMMENT_TITLE = 'Move inline comment to its own line'

export default class EditorConfigCodeActionProvider
	implements CodeActionProvider
{
	public static readonly providedCodeActionKinds = [CodeActionKind.QuickFix]

	public provideCodeActions(
		document: TextDocument,
		_range: Range | Selection,
		context: CodeActionContext,
	) {
		return context.diagnostics
			.filter(isInlineCommentDiagnostic)
			.flatMap(diagnostic => {
				const line = document.lineAt(diagnostic.range.start.line)
				const movedComment = moveInlineCommentToOwnLine(
					line.text,
					document.eol === EndOfLine.CRLF ? '\r\n' : '\n',
				)
				if (!movedComment) {
					return []
				}

				const edit = new WorkspaceEdit()
				edit.replace(document.uri, line.range, movedComment)

				const action = new CodeAction(
					MOVE_INLINE_COMMENT_TITLE,
					CodeActionKind.QuickFix,
				)
				action.diagnostics = [diagnostic]
				action.edit = edit
				action.isPreferred = true
				return [action]
			})
	}
}

function isInlineCommentDiagnostic(diagnostic: Diagnostic) {
	return diagnostic.code === INLINE_COMMENT_DIAGNOSTIC_CODE
}

export { MOVE_INLINE_COMMENT_TITLE }
