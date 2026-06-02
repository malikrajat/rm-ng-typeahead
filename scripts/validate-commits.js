#!/usr/bin/env node

/**
 * Commit message validator and analyzer
 */
const { execSync } = require('child_process');
const fs = require('fs');

const COMMIT_TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor',
  'perf', 'test', 'chore', 'ci', 'build', 'revert'
];

const SCOPES = [
  'typeahead', 'chips', 'search', 'accessibility', 'performance',
  'styling', 'forms', 'config', 'docs', 'demo', 'build', 'deps', 'release'
];

class CommitValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validateCommitMessage(message) {
    this.errors = [];
    this.warnings = [];

    const lines = message.split('\n');
    const subject = lines[0];
    const body = lines.slice(2).join('\n').trim();

    this.validateSubject(subject);
    this.validateBody(body);
    this.validateOverall(message);

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      analysis: this.analyzeCommit(subject)
    };
  }

  validateSubject(subject) {
    // Length check
    if (subject.length > 72) {
      this.errors.push(`Subject too long: ${subject.length}/72 characters`);
    }

    if (subject.length < 10) {
      this.warnings.push(`Subject quite short: ${subject.length} characters`);
    }

    // Conventional commit format check
    const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?(!)?:\s.+/;
    if (!conventionalRegex.test(subject)) {
      this.errors.push('Subject does not follow conventional commit format');
      this.errors.push('Expected format: <type>(<scope>): <description>');
      return;
    }

    // Extract parts
    const match = subject.match(/^([a-z]+)(\(([^)]+)\))?(!)?\s*:\s*(.+)$/);
    if (!match) {
      this.errors.push('Could not parse conventional commit format');
      return;
    }

    const [, type, , scope, breaking, description] = match;

    // Validate type
    if (!COMMIT_TYPES.includes(type)) {
      this.errors.push(`Invalid commit type: "${type}". Valid types: ${COMMIT_TYPES.join(', ')}`);
    }

    // Validate scope (if present)
    if (scope && !SCOPES.includes(scope)) {
      this.warnings.push(`Unrecognized scope: "${scope}". Common scopes: ${SCOPES.join(', ')}`);
    }

    // Validate description
    if (description.length < 5) {
      this.errors.push('Description too short (minimum 5 characters)');
    }

    if (description.endsWith('.')) {
      this.errors.push('Description should not end with a period');
    }

    if (!/^[a-z]/.test(description)) {
      this.errors.push('Description should start with lowercase letter');
    }

    // Check for imperative mood (basic patterns)
    const nonImperativePatterns = [
      /^(added|fixed|changed|updated|removed|deleted)/i,
      /^(adding|fixing|changing|updating|removing|deleting)/i,
      /(ed|ing)\s/i
    ];

    if (nonImperativePatterns.some(pattern => pattern.test(description))) {
      this.warnings.push('Description should use imperative mood (e.g., "add" not "added")');
    }

    // Check for breaking change indicator
    if (breaking && !subject.includes('BREAKING CHANGE')) {
      this.warnings.push('Breaking change indicator found, consider adding BREAKING CHANGE in footer');
    }
  }

  validateBody(body) {
    if (!body) return;

    const lines = body.split('\n');

    // Check line length
    lines.forEach((line, index) => {
      if (line.length > 100) {
        this.warnings.push(`Body line ${index + 1} too long: ${line.length}/100 characters`);
      }
    });

    // Check for good practices
    if (body.length > 500) {
      this.warnings.push('Body is quite long, consider breaking into smaller commits');
    }
  }

  validateOverall(message) {
    // Check for blank line between subject and body
    const lines = message.split('\n');
    if (lines.length > 1 && lines[1] !== '') {
      this.errors.push('Missing blank line between subject and body');
    }

    // Check for common issues
    if (message.includes('TODO') || message.includes('FIXME')) {
      this.warnings.push('Commit contains TODO/FIXME - consider completing before committing');
    }

    // Check for debugging references
    if (message.toLowerCase().includes('debug') || message.toLowerCase().includes('console.log')) {
      this.warnings.push('Commit mentions debugging - ensure debug code is removed');
    }
  }

  analyzeCommit(subject) {
    const match = subject.match(/^([a-z]+)(\(([^)]+)\))?(!)?\s*:\s*(.+)$/);
    if (!match) return null;

    const [, type, , scope, breaking, description] = match;

    // Determine version impact
    let versionImpact = 'none';
    if (breaking) {
      versionImpact = 'major';
    } else if (type === 'feat') {
      versionImpact = 'minor';
    } else if (['fix', 'perf', 'revert'].includes(type)) {
      versionImpact = 'patch';
    }

    return {
      type,
      scope: scope || null,
      breaking: !!breaking,
      description,
      versionImpact,
      category: this.getCategoryForType(type),
      emoji: this.getEmojiForType(type)
    };
  }

  getCategoryForType(type) {
    const categories = {
      feat: 'Features',
      fix: 'Bug Fixes',
      docs: 'Documentation',
      style: 'Code Style',
      refactor: 'Code Refactoring',
      perf: 'Performance',
      test: 'Tests',
      chore: 'Chores',
      ci: 'CI/CD',
      build: 'Build System',
      revert: 'Reverts'
    };
    return categories[type] || 'Other';
  }

  getEmojiForType(type) {
    const emojis = {
      feat: '✨',
      fix: '🐛',
      docs: '📚',
      style: '💎',
      refactor: '♻️',
      perf: '⚡',
      test: '🧪',
      chore: '🔧',
      ci: '👷',
      build: '📦',
      revert: '⏪'
    };
    return emojis[type] || '📝';
  }

  validateCommitHistory(count = 10) {
    console.log(`🔍 Analyzing last ${count} commits...\n`);

    try {
      const commits = execSync(`git log --oneline -${count} --format="%H|%s"`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(line => line.trim());

      const results = commits.map(commit => {
        const [hash, subject] = commit.split('|');
        const validation = this.validateCommitMessage(subject);
        return { hash: hash.substring(0, 8), subject, ...validation };
      });

      // Summary
      const validCount = results.filter(r => r.valid).length;
      const invalidCount = results.length - validCount;

      console.log(`📊 Summary: ${validCount} valid, ${invalidCount} invalid commits\n`);

      // Show results
      results.forEach(result => {
        const status = result.valid ? '✅' : '❌';
        const emoji = result.analysis ? result.analysis.emoji : '📝';
        const impact = result.analysis ? ` (${result.analysis.versionImpact})` : '';

        console.log(`${status} ${emoji} ${result.hash} ${result.subject}${impact}`);

        if (result.errors.length > 0) {
          result.errors.forEach(error => console.log(`   ❌ ${error}`));
        }

        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
        }

        console.log();
      });

      return results;

    } catch (error) {
      console.error('❌ Error reading git history:', error.message);
      return [];
    }
  }

  validateCommitFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Commit file not found: ${filePath}`);
      return false;
    }

    const message = fs.readFileSync(filePath, 'utf8').trim();
    const result = this.validateCommitMessage(message);

    console.log('📝 Commit Message:');
    console.log('─'.repeat(50));
    console.log(message);
    console.log('─'.repeat(50));

    if (result.valid) {
      console.log('✅ Commit message is valid!');

      if (result.analysis) {
        const analysis = result.analysis;
        console.log(`\n📊 Analysis:`);
        console.log(`   Type: ${analysis.emoji} ${analysis.type} (${analysis.category})`);
        console.log(`   Scope: ${analysis.scope || 'none'}`);
        console.log(`   Breaking: ${analysis.breaking ? 'Yes' : 'No'}`);
        console.log(`   Version Impact: ${analysis.versionImpact}`);
      }
    } else {
      console.log('❌ Commit message has errors:');
      result.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    return result.valid;
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const validator = new CommitValidator();

  switch (command) {
    case 'history':
      const count = parseInt(args[1]) || 10;
      validator.validateCommitHistory(count);
      break;

    case 'file':
      const filePath = args[1] || '.git/COMMIT_EDITMSG';
      const isValid = validator.validateCommitFile(filePath);
      process.exit(isValid ? 0 : 1);
      break;

    case 'message':
      const message = args.slice(1).join(' ');
      if (!message) {
        console.error('❌ No commit message provided');
        process.exit(1);
      }

      const result = validator.validateCommitMessage(message);
      console.log(result.valid ? '✅ Valid' : '❌ Invalid');

      if (!result.valid) {
        result.errors.forEach(error => console.log(`   • ${error}`));
      }

      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(warning => console.log(`   • ${warning}`));
      }

      process.exit(result.valid ? 0 : 1);
      break;

    default:
      console.log(`
🔍 Commit Message Validator

Usage:
  node validate-commits.js history [count]    # Validate commit history
  node validate-commits.js file [path]        # Validate commit file
  node validate-commits.js message <msg>      # Validate specific message

Examples:
  node validate-commits.js history 20
  node validate-commits.js file .git/COMMIT_EDITMSG
  node validate-commits.js message "feat(search): add fuzzy matching"

Quick validation:
  git log --oneline -5                        # View recent commits
  npm run commit:help                         # Show commit commands
      `);
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = CommitValidator;
