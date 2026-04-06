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

/**
 * Matches an inline comment: any line that contains non-whitespace content
 * followed by an unquoted `#` or `;` (with optional preceding whitespace).
 * Lines where `#` or `;` is the first non-whitespace character are proper
 * standalone comments and are excluded before this regex is applied.
 */
const INLINE_COMMENT_RE = /\S.*?[ \t]*([#;].*)$/

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

		this.disposable = Disposable.from.apply(this, subscriptions)
	}

	private analyze(doc: TextDocument) {
		if (doc.languageId !== 'editorconfig') {
			return
		}

		const diagnostics: Diagnostic[] = []

		for (let i = 0; i < doc.lineCount; i++) {
			const { text } = doc.lineAt(i)

			// Skip blank lines and proper standalone comment lines
			const trimmed = text.trimStart()
			if (
				trimmed.length === 0 ||
				trimmed.startsWith('#') ||
				trimmed.startsWith(';')
			) {
				continue
			}

			const match = INLINE_COMMENT_RE.exec(text)
			if (match) {
				const commentStart = text.length - match[1].length
				const range = new Range(i, commentStart, i, text.length)
				diagnostics.push(
					new Diagnostic(
						range,
						'Inline comments are not supported in EditorConfig. Move this comment to its own line.',
						DiagnosticSeverity.Warning,
					),
				)
			}
		}

		this.collection.set(doc.uri, diagnostics)
	}

	public dispose() {
		this.collection.dispose()
		this.disposable.dispose()
	}
}
