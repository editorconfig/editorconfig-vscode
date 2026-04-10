import * as assert from 'node:assert'
import * as path from 'node:path'
import { TextEditorOptions, Uri, window } from 'vscode'
import * as utils from 'vscode-test-utils'

export async function getOptionsForFixture(file: string[]) {
	await utils.openFile(Uri.file(getFixturePath(file)))
	return await getTextEditorOptions()
}

export function getFixturePath(file: string[]) {
	return path.resolve(
		path.join(__dirname, '..', 'test', 'suite', 'fixtures', ...file),
	)
}

export function wait(ms: number) {
	return new Promise<void>(resolve => {
		setTimeout(resolve, ms)
	})
}

async function getTextEditorOptions() {
	const eventPromise = new Promise<TextEditorOptions>(resolve => {
		window.onDidChangeTextEditorOptions(e => {
			assert.ok(e.options)
			resolve(e.options)
		})
	})

	const fallbackPromise = (async () => {
		await wait(100)
		assert.ok(window.activeTextEditor!.options)
		return window.activeTextEditor!.options
	})()

	return await Promise.race([eventPromise, fallbackPromise])
}
