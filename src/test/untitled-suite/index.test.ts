import * as assert from 'node:assert'
import { commands, window } from 'vscode'
import * as utils from 'vscode-test-utils'
import { wait } from '../testUtils'

suite('EditorConfig extension untitled workspace', function () {
	this.retries(2)
	suiteTeardown(utils.closeAllFiles)

	test('untitled editors use the first workspace folder config', async () => {
		await commands.executeCommand('workbench.action.files.newUntitledFile')
		await wait(200)

		const activeEditor = window.activeTextEditor

		assert.strictEqual(activeEditor!.options.tabSize, 2)
	})
})
