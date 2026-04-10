import { TextDocument, TextDocumentSaveReason, TextEdit } from 'vscode'
import { KnownProps } from 'editorconfig'

export abstract class PreSaveTransformation {
	public abstract transform(
		editorconfig: KnownProps,
		doc?: TextDocument,
		reason?: TextDocumentSaveReason,
	): {
		edits: TextEdit[] | Error
		message?: string
	}
}
