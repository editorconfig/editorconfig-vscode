/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  // Define the branches that will trigger a release
  // We only want to release from the main branch
  branches: [{ name: 'main', channel: 'latest' }],

  // Plugins that will be executed during the release process
  plugins: [
    // Analyzes commits to determine the type of release (major/minor/patch)
    // Uses the Conventional Commits specification
    '@semantic-release/commit-analyzer',

    // Generates release notes based on the commits since the last release
    // This creates a comprehensive changelog for each release
    '@semantic-release/release-notes-generator',

    // Creates or updates the CHANGELOG.md file with the release notes
    '@semantic-release/changelog',

    // Updates the version in package.json
    // We don't publish to npm since this is a VSCode extension
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],

    // Commits the updated files (package.json and CHANGELOG.md)
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message: `chore(release): \${nextRelease.version} [skip ci]\n\n\${nextRelease.notes}`,
      },
    ],

    // Creates a GitHub release and attaches the VSIX package
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'editorconfig-vscode-*.vsix', label: 'Extension Package' },
        ],
      },
    ],
  ],
}
