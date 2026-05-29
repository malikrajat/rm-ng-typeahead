# Release Automation Scripts

This directory contains scripts for automating the release process and changelog generation.

## Scripts

### `generate-changelog.js`
Generates changelog entries from conventional commits.

### `release.js` 
Automates the full release process including version bumping, changelog generation, and publishing.

### `validate-commits.js`
Validates commit messages follow conventional commit format.

## Usage

```bash
# Generate changelog
node scripts/generate-changelog.js

# Prepare release
node scripts/release.js --type patch|minor|major

# Validate commits
node scripts/validate-commits.js
```
