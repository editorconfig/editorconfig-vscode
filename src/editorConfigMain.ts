import {
	CodeActionKind,
	commands,
	DocumentSelector,
	ExtensionContext,
	languages,
} from 'vscode'
import {
	applyTextEditorOptions,
	fromEditorConfig,
	resolveCoreConfig,
	resolveTextEditorOptions,
	toEditorConfig,
} from './api'
import EditorConfigCodeActionProvider from './EditorConfigCodeActionProvider'
import { generateEditorConfig } from './commands/generateEditorConfig'
import DocumentWatcher from './DocumentWatcher'
import EditorConfigCompletionProvider from './EditorConfigCompletionProvider'
import EditorConfigDiagnosticsProvider from './EditorConfigDiagnosticsProvider'

/**
 * Main entry
 */
export function activate(ctx: ExtensionContext) {
	ctx.subscriptions.push(new DocumentWatcher())
	ctx.subscriptions.push(new EditorConfigDiagnosticsProvider())

	// register .editorconfig file completion provider
	const editorConfigFileSelector: DocumentSelector = {
		language: 'editorconfig',
		pattern: '**/.editorconfig',
		scheme: 'file',
	}
	languages.registerCompletionItemProvider(
		editorConfigFileSelector,
		new EditorConfigCompletionProvider(),
	)
	languages.registerCodeActionsProvider(
		{ language: 'editorconfig' },
		new EditorConfigCodeActionProvider(),
		{
			providedCodeActionKinds: [CodeActionKind.QuickFix],
		},
	)

	// register an internal command used to automatically display IntelliSense
	// when editing a .editorconfig file
	commands.registerCommand('editorconfig._triggerSuggestAfterDelay', () => {
		setTimeout(() => {
			commands.executeCommand('editor.action.triggerSuggest')
		}, 100)
	})

	// register a command handler to generate a .editorconfig file
	commands.registerCommand('EditorConfig.generate', generateEditorConfig)

	return {
		applyTextEditorOptions,
		fromEditorConfig,
		resolveCoreConfig,
		resolveTextEditorOptions,
		toEditorConfig,
	}
}
