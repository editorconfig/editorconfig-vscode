import fs from 'fs/promises'
import { defineConfig, Options } from 'tsup'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'

const baseConfig = {
	entry: ['src/editorConfigMain.ts'],
	format: 'cjs',
	sourcemap: true,
	external: ['vscode'],
	loader: { '.editorconfig': 'text' },
	clean: true,
} satisfies Options

const desktopConfig = {
	...baseConfig,
	target: 'node12',
	platform: 'node',
	outDir: 'out/desktop',
} satisfies Options

const webConfig = {
	...baseConfig,
	target: 'es2019',
	platform: 'browser',
	esbuildPlugins: [polyfillNode()],
	outDir: 'out/browser',
} satisfies Options

const testConfig = {
	...baseConfig,
	entry: ['src/test/**/*'],
	target: 'node18',
	platform: 'node',
	onSuccess: copyFixtures,
	outDir: 'out/desktop/test',
} satisfies Options

export default defineConfig([desktopConfig, webConfig, testConfig])

async function copyFixtures() {
	await Promise.all([
		fs.cp('./src/test/suite/fixtures', './out/desktop/test/suite/fixtures', {
			recursive: true,
		}),
		fs.cp(
			'./src/test/untitled-suite/fixtures',
			'./out/desktop/test/untitled-suite/fixtures',
			{
				recursive: true,
			},
		),
	])
}
