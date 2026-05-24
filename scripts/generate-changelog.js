#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Generate changelog from conventional commits
 */
function generateChangelog() {
  console.log('🔄 Generating changelog from conventional commits...');

  try {
    // Generate changelog using conventional-changelog
    execSync('npx conventional-changelog -p angular -i CHANGELOG.md -s', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('✅ Changelog generated successfully!');

    // Read and validate the changelog
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    if (fs.existsSync(changelogPath)) {
      const content = fs.readFileSync(changelogPath, 'utf8');
      const lines = content.split('\n').length;
      console.log(`📄 Changelog contains ${lines} lines`);
    }

  } catch (error) {
    console.error('❌ Error generating changelog:', error.message);
    process.exit(1);
  }
}

/**
 * Generate changelog from specific commit range
 */
function generateChangelogFromRange(from, to = 'HEAD') {
  console.log(`🔄 Generating changelog from ${from} to ${to}...`);

  try {
    execSync(`npx conventional-changelog -p angular -r 1 --commit-path . --since ${from}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('✅ Changelog from range generated successfully!');
  } catch (error) {
    console.error('❌ Error generating changelog from range:', error.message);
    process.exit(1);
  }
}

/**
 * Validate changelog format
 */
function validateChangelog() {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');

  if (!fs.existsSync(changelogPath)) {
    console.error('❌ CHANGELOG.md not found');
    return false;
  }

  const content = fs.readFileSync(changelogPath, 'utf8');

  // Check for required sections
  const requiredSections = ['## [Unreleased]', '## ['];
  const missingsections = requiredSections.filter(section => !content.includes(section));

  if (missingSections.length > 0) {
    console.error('❌ Changelog missing required sections:', missingSections);
    return false;
  }

  console.log('✅ Changelog format is valid');
  return true;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'generate':
      generateChangelog();
      break;

    case 'range':
      const from = args[1];
      const to = args[2];
      if (!from) {
        console.error('❌ Missing "from" commit for range generation');
        process.exit(1);
      }
      generateChangelogFromRange(from, to);
      break;

    case 'validate':
      validateChangelog();
      break;

    default:
      console.log(`
🚀 Changelog Generator

Usage:
  node generate-changelog.js generate          # Generate full changelog
  node generate-changelog.js range <from> [to] # Generate from commit range
  node generate-changelog.js validate          # Validate changelog format

Examples:
  node generate-changelog.js generate
  node generate-changelog.js range v1.0.0 HEAD
  node generate-changelog.js validate
      `);
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateChangelog,
  generateChangelogFromRange,
  validateChangelog
};
