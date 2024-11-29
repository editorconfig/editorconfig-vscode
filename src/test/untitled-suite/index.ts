import glob from 'fast-glob'
import Mocha from 'mocha'
import path from 'path'

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		color: true,
		timeout: 5000,
		ui: 'tdd',
	})

	return new Promise((resolve, reject) => {
		const files = glob.sync('./**/*.test.js', { cwd: __dirname })

		// Add files to the test suite
		files.forEach(file => mocha.addFile(path.resolve(__dirname, file)))

		try {
			// Run the mocha test
			mocha.run(failures => {
				if (failures > 0) {
					reject(new Error(`${failures} tests failed.`))
				} else {
					resolve()
				}
			})
		} catch (err) {
			reject(err)
		}
	})
}
