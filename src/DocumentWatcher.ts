import * as path from 'path'
import {
	Disposable,
	TextDocument,
	TextDocumentSaveReason,
	TextEditor,
	TextEditorOptions,
	window,
	workspace,
} from 'vscode'
import { KnownProps } from 'editorconfig'

import {
	InsertFinalNewline,
	PreSaveTransformation,
	SetEndOfLine,
	TrimTrailingWhitespace,
} from './transformations'
import {
	applyTextEditorOptions,
	resolveCoreConfig,
	resolveFile,
	resolveTextEditorOptions,
} from './api'

type Charset = Exclude<KnownProps['charset'], undefined | 'unset'>
type EncodingMap = Record<Charset, TextDocument['encoding']>
const encodingMap = {
	'utf-8': 'utf8',
	'utf-8-bom': 'utf8bom',
	'utf-16le': 'utf16le',
	'utf-16be': 'utf16be',
	latin1: 'iso88591',
} as const satisfies EncodingMap

export default class DocumentWatcher {
	private disposable: Disposable
	private preSaveTransformations: PreSaveTransformation[] = [
		new SetEndOfLine(),
		new TrimTrailingWhitespace(),
		new InsertFinalNewline(),
	]
	private doc?: TextDocument

	public constructor(
		private outputChannel = window.createOutputChannel('EditorConfig'),
	) {
		this.log('Initializing document watcher...')

		const subscriptions: Disposable[] = []

		this.handleTextEditorChange(window.activeTextEditor)

		subscriptions.push(
			window.onDidChangeActiveTextEditor(async editor => {
				this.handleTextEditorChange(editor)
			}),
		)

		subscriptions.push(
			window.onDidChangeWindowState(async state => {
				if (state.focused && this.doc) {
					const newOptions = await resolveTextEditorOptions(this.doc, {
						onEmptyConfig: this.onEmptyConfig,
					})
					applyTextEditorOptions(newOptions, {
						onNoActiveTextEditor: this.onNoActiveTextEditor,
						onSuccess: this.onSuccess,
					})
				}
			}),
		)

		subscriptions.push(
			workspace.onDidSaveTextDocument(doc => {
				if (path.basename(doc.fileName) === '.editorconfig') {
					this.log('.editorconfig file saved.')
				}
				// in case document was dirty on open/text editor change
				this.handleDocumentEncoding(doc)
			}),
		)

		subscriptions.push(
			workspace.onWillSaveTextDocument(async e => {
				const transformations = this.calculatePreSaveTransformations(
					e.document,
					e.reason,
				)
				e.waitUntil(transformations)
			}),
		)

		subscriptions.push(
			workspace.onDidOpenTextDocument(this.handleDocumentEncoding),
		)

		this.disposable = Disposable.from.apply(this, subscriptions)
		this.log('Document watcher initialized')
	}

	public onEmptyConfig = (relativePath: string) => {
		this.log(`${relativePath}: No configuration.`)
	}

	public onBeforeResolve = (relativePath: string) => {
		this.log(`${relativePath}: Using EditorConfig core...`)
	}

	public onNoActiveTextEditor = () => {
		this.log('No more open editors.')
	}

	public onSuccess = (newOptions: TextEditorOptions) => {
		if (!this.doc) {
			this.log(`[no file]: ${JSON.stringify(newOptions)}`)
			return
		}
		const { relativePath } = resolveFile(this.doc)
		this.log(`${relativePath}: ${JSON.stringify(newOptions)}`)
	}

	public log(...messages: string[]) {
		this.outputChannel.appendLine(messages.join(' '))
	}

	public dispose() {
		this.disposable.dispose()
	}

	private async calculatePreSaveTransformations(
		doc: TextDocument,
		reason: TextDocumentSaveReason,
	) {
		const editorconfigSettings = await resolveCoreConfig(doc, {
			onBeforeResolve: this.onBeforeResolve,
		})
		const relativePath = workspace.asRelativePath(doc.fileName)

		if (!editorconfigSettings) {
			this.log(`${relativePath}: No configuration found for pre-save.`)
			return []
		}

		return [
			...this.preSaveTransformations.flatMap(transformer => {
				const { edits, message } = transformer.transform(
					editorconfigSettings,
					doc,
					reason,
				)
				if (edits instanceof Error) {
					this.log(`${relativePath}: ${edits.message}`)
					return []
				}
				if (message) {
					this.log(`${relativePath}: ${message}`)
				}
				return edits
			}),
		]
	}

	private async handleTextEditorChange(editor?: TextEditor) {
		if (editor?.document) {
			const newOptions = await resolveTextEditorOptions(
				(this.doc = editor.document),
				{
					onEmptyConfig: this.onEmptyConfig,
				},
			)
			applyTextEditorOptions(newOptions, {
				onNoActiveTextEditor: this.onNoActiveTextEditor,
				onSuccess: this.onSuccess,
			})
			this.handleDocumentEncoding(editor.document)
		}
	}

	private async handleDocumentEncoding(document: TextDocument) {
		const relativePath = workspace.asRelativePath(document.fileName)
		const editorconfigSettings = await resolveCoreConfig(document, {
			onBeforeResolve: this.onBeforeResolve,
		})

		const currentEncoding = document.encoding
		const { charset } = editorconfigSettings
		this.log(`${relativePath}: Target charset is`, charset ?? 'not set')
		if (!charset) {
			return
		}
		if (!(charset in encodingMap)) {
			this.log(`${relativePath}: Unsupported charset`)
			return
		}

		const targetEncoding = encodingMap[charset as keyof typeof encodingMap]
		if (document.encoding !== targetEncoding) {
			if (document.isDirty) {
				this.log(`${relativePath}: Cannot change encoding, document is dirty`)
				return
			}
			this.log(
				`${relativePath}: Changing encoding from to ${targetEncoding}...`,
			)
			await workspace.openTextDocument(document.uri, {
				encoding: targetEncoding,
			})
		}
	}
}
