import {
	Diagnostic,
	DiagnosticCollection,
	DiagnosticSeverity,
	Disposable,
	languages,
	Range,
	TextDocument,
	workspace,
} from 'vscode'
import {
	findInlineComment,
	INLINE_COMMENT_DIAGNOSTIC_CODE,
	INLINE_COMMENT_DIAGNOSTIC_MESSAGE,
} from './inlineComments'

export default class EditorConfigDiagnosticsProvider {
	private collection: DiagnosticCollection
	private disposable: Disposable

	public constructor() {
		this.collection = languages.createDiagnosticCollection('editorconfig')

		const subscriptions: Disposable[] = []

		// Analyze documents that are already open when the extension activates
		for (const doc of workspace.textDocuments) {
			this.analyze(doc)
		}

		subscriptions.push(
			workspace.onDidOpenTextDocument(doc => this.analyze(doc)),
		)
		subscriptions.push(
			workspace.onDidChangeTextDocument(e => this.analyze(e.document)),
		)
		subscriptions.push(
			workspace.onDidCloseTextDocument(doc =>
				this.collection.delete(doc.uri),
			),
		)

		this.disposable = Disposable.from(...subscriptions)
	}

	private analyze(doc: TextDocument) {
		if (doc.languageId !== 'editorconfig') {
			return
		}

		const diagnostics: Diagnostic[] = []

		for (let i = 0; i < doc.lineCount; i++) {
			const { text } = doc.lineAt(i)
			const inlineComment = findInlineComment(text)
			if (inlineComment) {
				const range = new Range(
					i,
					inlineComment.commentStart,
					i,
					text.length,
				)
				const diagnostic = new Diagnostic(
					range,
					INLINE_COMMENT_DIAGNOSTIC_MESSAGE,
					DiagnosticSeverity.Warning,
				)
				diagnostic.code = INLINE_COMMENT_DIAGNOSTIC_CODE
				diagnostic.source = 'editorconfig'
				diagnostics.push(diagnostic)
			}
		}

		this.collection.set(doc.uri, diagnostics)
	}

	public dispose() {
		this.collection.dispose()
		this.disposable.dispose()
	}
}
