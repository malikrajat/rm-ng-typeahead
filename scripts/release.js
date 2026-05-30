#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { generateChangelog, validateChangelog } = require('./generate-changelog');

/**
 * Release automation script
 */
class ReleaseManager {
  constructor() {
    this.packagePath = path.join(process.cwd(), 'package.json');
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  }

  /**
   * Get current version from package.json
   */
  getCurrentVersion() {
    if (!fs.existsSync(this.packagePath)) {
      throw new Error('package.json not found');
    }

    const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    return packageJson.version;
  }

  /**
   * Update version in package.json
   */
  updateVersion(newVersion) {
    const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(this.packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`📦 Updated version to ${newVersion}`);
  }

  /**
   * Calculate next version based on type
   */
  calculateNextVersion(currentVersion, releaseType) {
    const versionParts = currentVersion.split('.').map(Number);

    switch (releaseType) {
      case 'major':
        return `${versionParts[0] + 1}.0.0`;
      case 'minor':
        return `${versionParts[0]}.${versionParts[1] + 1}.0`;
      case 'patch':
        return `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`;
      default:
        throw new Error(`Invalid release type: ${releaseType}`);
    }
  }

  /**
   * Run pre-release checks
   */
  runPreReleaseChecks() {
    console.log('🔍 Running pre-release checks...');

    // Check git status
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim()) {
        console.warn('⚠️  Warning: There are uncommitted changes');
        console.log(gitStatus);
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not check git status');
    }

    // Check if on main/master branch
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (!['main', 'master'].includes(currentBranch)) {
        console.warn(`⚠️  Warning: Not on main branch (current: ${currentBranch})`);
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not check current branch');
    }

    // Run tests
    console.log('🧪 Running tests...');
    try {
      execSync('npm run test -- --watch=false --browsers=ChromeHeadless', { stdio: 'inherit' });
      console.log('✅ Tests passed');
    } catch (error) {
      console.error('❌ Tests failed');
      throw error;
    }

    // Run linting
    console.log('🔍 Running linter...');
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      console.log('✅ Linting passed');
    } catch (error) {
      console.error('❌ Linting failed');
      throw error;
    }

    // Build library
    console.log('🏗️  Building library...');
    try {
      execSync('npm run build:lib', { stdio: 'inherit' });
      console.log('✅ Library build successful');
    } catch (error) {
      console.error('❌ Library build failed');
      throw error;
    }
  }

  /**
   * Create git tag and commit
   */
  createGitTag(version, releaseType) {
    console.log('📝 Creating git commit and tag...');

    try {
      // Add all changes
      execSync('git add .');

      // Commit with conventional format
      const commitMessage = `chore(release): ${releaseType} release v${version}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

      // Create tag
      execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });

      console.log(`✅ Created commit and tag v${version}`);
    } catch (error) {
      console.error('❌ Failed to create git commit/tag');
      throw error;
    }
  }

  /**
   * Publish to npm
   */
  publishToNpm(dryRun = false) {
    console.log('📤 Publishing to npm...');

    try {
      const publishCommand = dryRun
        ? 'npm run release:dry-run'
        : 'npm run release:publish';

      execSync(publishCommand, { stdio: 'inherit' });

      if (dryRun) {
        console.log('✅ Dry-run publish successful');
      } else {
        console.log('✅ Published to npm successfully');
      }
    } catch (error) {
      console.error('❌ Failed to publish to npm');
      throw error;
    }
  }

  /**
   * Main release process
   */
  async release(releaseType, options = {}) {
    const { dryRun = false, skipTests = false, skipPublish = false } = options;

    console.log(`🚀 Starting ${releaseType} release process...`);

    try {
      // Get current version
      const currentVersion = this.getCurrentVersion();
      const nextVersion = this.calculateNextVersion(currentVersion, releaseType);

      console.log(`📊 Version: ${currentVersion} → ${nextVersion}`);

      if (!skipTests) {
        // Run pre-release checks
        this.runPreReleaseChecks();
      }

      // Generate changelog
      console.log('📝 Generating changelog...');
      generateChangelog();

      // Validate changelog
      if (!validateChangelog()) {
        throw new Error('Changelog validation failed');
      }

      // Update version
      this.updateVersion(nextVersion);

      if (!dryRun) {
        // Create git commit and tag
        this.createGitTag(nextVersion, releaseType);

        if (!skipPublish) {
          // Publish to npm
          this.publishToNpm(false);
        }

        console.log(`🎉 Release v${nextVersion} completed successfully!`);
        console.log('📋 Next steps:');
        console.log('  - Push commits: git push origin main');
        console.log('  - Push tags: git push origin --tags');
        console.log('  - Create GitHub release');
      } else {
        console.log('🧪 Dry-run completed successfully');
        console.log('  No commits, tags, or publications were made');
      }

    } catch (error) {
      console.error('❌ Release failed:', error.message);
      process.exit(1);
    }
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const releaseType = args.find(arg => ['major', 'minor', 'patch'].includes(arg));
  const dryRun = args.includes('--dry-run');
  const skipTests = args.includes('--skip-tests');
  const skipPublish = args.includes('--skip-publish');

  if (!releaseType) {
    console.log(`
🚀 Release Manager

Usage:
  node release.js <major|minor|patch> [options]

Options:
  --dry-run      # Run without making actual changes
  --skip-tests   # Skip running tests and linting
  --skip-publish # Skip npm publishing

Examples:
  node release.js patch                    # Patch release
  node release.js minor --dry-run          # Minor release dry-run
  node release.js major --skip-tests       # Major release, skip tests
    `);
    return;
  }

  const releaseManager = new ReleaseManager();
  releaseManager.release(releaseType, { dryRun, skipTests, skipPublish });
}

if (require.main === module) {
  main();
}

module.exports = ReleaseManager;
