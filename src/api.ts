import * as editorconfig from 'editorconfig'
import {
	TextDocument,
	TextEditorOptions,
	Uri,
	window,
	workspace,
	commands,
} from 'vscode'

/**
 * Resolves `TextEditorOptions` for a `TextDocument`, combining the editor's
 * default configuration with that of EditorConfig's configuration.
 */
export async function resolveTextEditorOptions(
	doc: TextDocument,
	{
		onBeforeResolve,
		onEmptyConfig,
	}: {
		onBeforeResolve?: (relativePath: string) => void
		onEmptyConfig?: (relativePath: string) => void
	} = {},
) {
	const coreConfig = await resolveCoreConfig(doc, { onBeforeResolve })
	if (coreConfig) {
		const defaults = pickWorkspaceDefaults(doc)
		const converted = fromEditorConfig(coreConfig)
		const combined = { ...defaults, ...converted }

		// decouple tabSize from indentSize when possible
		if (
			!Number.isInteger(coreConfig.tab_width) &&
			!(combined.insertSpaces && combined.indentSize === 'tabSize') &&
			!(
				coreConfig.indent_style === 'tab' &&
				Number.isInteger(coreConfig.indent_size)
			) &&
			Number.isInteger(defaults.tabSize)
		) {
			combined.tabSize = defaults.tabSize
		}

		return combined
	}
	if (onEmptyConfig) {
		const { relativePath } = resolveFile(doc)
		if (relativePath) {
			onEmptyConfig(relativePath)
		}
	}
	return {}
}

/**
 * Applies new `TextEditorOptions` to the active text editor.
 */
export async function applyTextEditorOptions(
	newOptions: TextEditorOptions,
	{
		onNoActiveTextEditor,
		onSuccess,
	}: {
		onNoActiveTextEditor?: () => void
		onSuccess?: (newOptions: TextEditorOptions) => void
	} = {},
) {
	const editor = window.activeTextEditor
	if (!editor) {
		if (onNoActiveTextEditor) {
			onNoActiveTextEditor()
		}
		return
	}

	editor.options = newOptions

	if (onSuccess) {
		onSuccess(newOptions)
	}
}

/**
 * Picks EditorConfig-relevant props from the editor's default configuration.
 */
export function pickWorkspaceDefaults(doc?: TextDocument): {
	/**
	 * The number of spaces a tab is equal to. When `editor.detectIndentation`
	 * is on, this property value will be `undefined`.
	 */
	tabSize?: number
	/**
	 * Insert spaces when pressing `Tab`. When `editor.detectIndentation` is on,
	 * this property value will be `undefined`.
	 */
	insertSpaces?: boolean
	/**
	 * The number of spaces used for indentation or `undefined` if
	 * `editor.detectIndentation` is on.
	 */
	indentSize?: number | string
} {
	commands.executeCommand('editor.action.detectIndentation')
	const workspaceConfig = workspace.getConfiguration('editor', doc)
	const detectIndentation = workspaceConfig.get<boolean>('detectIndentation')

	return detectIndentation
		? {}
		: {
				tabSize: workspaceConfig.get<number>('tabSize'),
				indentSize: workspaceConfig.get<number | string>('indentSize'),
				insertSpaces: workspaceConfig.get<boolean>('insertSpaces'),
			}
}

export type ResolvedCoreConfig = editorconfig.KnownProps &
	Record<string, string | number | boolean>

/**
 * Resolves an EditorConfig configuration for the file related to a
 * `TextDocument`.
 */
export async function resolveCoreConfig(
	doc: TextDocument,
	{
		onBeforeResolve,
	}: { onBeforeResolve?: (relativePath: string) => void } = {},
): Promise<ResolvedCoreConfig> {
	const { fileName, relativePath } = resolveFile(doc)
	if (!fileName) {
		return {}
	}
	if (relativePath) {
		onBeforeResolve?.(relativePath)
	}
	const config = await editorconfig.parse(fileName)
	if (config.indent_size === 'tab') {
		config.indent_size = config.tab_width
	}
	return config as ResolvedCoreConfig
}

export function resolveFile(doc: TextDocument): {
	fileName?: string
	relativePath?: string
} {
	if (doc.languageId === 'Log') {
		return {}
	}
	const file = getFile()
	return {
		fileName: file?.fsPath,
		relativePath: file && workspace.asRelativePath(file, true),
	}

	function getFile(): Uri | undefined {
		if (!doc.isUntitled) {
			return doc.uri
		}
		if (workspace.workspaceFolders?.[0]) {
			return Uri.joinPath(workspace.workspaceFolders[0].uri, doc.fileName)
		}
		return undefined
	}
}

/**
 * Convert .editorconfig values to vscode editor options
 */
export function fromEditorConfig(
	config: editorconfig.KnownProps = {},
): TextEditorOptions {
	const resolved: TextEditorOptions = {}

	if (Number.isInteger(config.indent_size)) {
		resolved.indentSize = config.indent_size
	} else if (config.indent_size === 'tab') {
		resolved.indentSize = 'tabSize'
	}

	if (Number.isInteger(config.tab_width)) {
		resolved.tabSize = config.tab_width
	} else if (Number.isInteger(config.indent_size)) {
		resolved.tabSize = config.indent_size
	}

	if (config.indent_style === 'tab') {
		resolved.insertSpaces = false
	} else if (config.indent_style === 'space') {
		resolved.insertSpaces = true
	}

	return resolved
}

/**
 * Convert vscode editor options to .editorconfig values
 */
export function toEditorConfig(options: TextEditorOptions) {
	const result: editorconfig.KnownProps = {}

	switch (options.insertSpaces) {
		case true:
			result.indent_style = 'space'
			if (options.tabSize) {
				result.indent_size = resolveTabSize(options.tabSize)
			}
			break
		case false:
		case 'auto':
			result.indent_style = 'tab'
			if (options.tabSize) {
				result.tab_width = resolveTabSize(options.tabSize)
			}
			break
	}

	return result

	/**
	 * Convert vscode tabSize option into numeric value
	 */
	function resolveTabSize(tabSize: number | string) {
		return tabSize === 'auto' ? 4 : parseInt(String(tabSize), 10)
	}
}
