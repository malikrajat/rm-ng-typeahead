#!/usr/bin/env node

/**
 * Interactive commit message creator with validation
 */
const readline = require('readline');
const { execSync } = require('child_process');

const COMMIT_TYPES = {
  feat: { description: 'New features', version: 'minor', emoji: '✨' },
  fix: { description: 'Bug fixes', version: 'patch', emoji: '🐛' },
  docs: { description: 'Documentation changes', version: 'none', emoji: '📚' },
  style: { description: 'Code style/formatting', version: 'none', emoji: '💎' },
  refactor: { description: 'Code refactoring', version: 'none', emoji: '♻️' },
  perf: { description: 'Performance improvements', version: 'patch', emoji: '⚡' },
  test: { description: 'Test additions/modifications', version: 'none', emoji: '🧪' },
  chore: { description: 'Build/tool changes', version: 'none', emoji: '🔧' },
  ci: { description: 'CI configuration', version: 'none', emoji: '👷' },
  build: { description: 'Build system changes', version: 'none', emoji: '📦' },
  revert: { description: 'Revert previous commits', version: 'patch', emoji: '⏪' }
};

const SCOPES = {
  typeahead: { description: 'Main typeahead component', emoji: '🎯' },
  chips: { description: 'Chip/tag functionality', emoji: '🏷️' },
  search: { description: 'Search functionality', emoji: '🔍' },
  accessibility: { description: 'Accessibility features', emoji: '♿' },
  performance: { description: 'Performance optimizations', emoji: '⚡' },
  styling: { description: 'CSS and theming', emoji: '🎨' },
  forms: { description: 'Form integration', emoji: '📝' },
  config: { description: 'Configuration system', emoji: '⚙️' },
  docs: { description: 'Documentation', emoji: '📖' },
  demo: { description: 'Demo application', emoji: '🚀' },
  build: { description: 'Build system', emoji: '🏗️' },
  deps: { description: 'Dependencies', emoji: '📦' },
  release: { description: 'Release management', emoji: '🎉' }
};

class CommitHelper {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  displayOptions(options, title) {
    console.log(`\n${title}:`);
    console.log('─'.repeat(50));
    Object.entries(options).forEach(([key, value], index) => {
      const emoji = value.emoji || '';
      const version = value.version ? ` (${value.version})` : '';
      console.log(`${String(index + 1).padStart(2)}. ${emoji} ${key.padEnd(12)} - ${value.description}${version}`);
    });
    console.log('─'.repeat(50));
  }

  async selectFromOptions(options, title, allowCustom = false) {
    this.displayOptions(options, title);

    const keys = Object.keys(options);
    const prompt = allowCustom
      ? `\nSelect (1-${keys.length}) or type custom: `
      : `\nSelect (1-${keys.length}): `;

    while (true) {
      const answer = await this.askQuestion(prompt);

      // Check if it's a number selection
      const num = parseInt(answer);
      if (num >= 1 && num <= keys.length) {
        return keys[num - 1];
      }

      // Check if it's a direct key
      if (keys.includes(answer)) {
        return answer;
      }

      // Allow custom input
      if (allowCustom && answer.trim()) {
        return answer.trim();
      }

      console.log('❌ Invalid selection. Please try again.');
    }
  }

  validateSubject(subject) {
    const errors = [];

    if (subject.length > 72) {
      errors.push('Subject too long (max 72 characters)');
    }

    if (subject.endsWith('.')) {
      errors.push('Subject should not end with a period');
    }

    if (!/^[a-z]/.test(subject)) {
      errors.push('Subject should start with lowercase letter');
    }

    if (!/^[a-z][^A-Z]*$/.test(subject)) {
      errors.push('Subject should use imperative mood and lowercase');
    }

    return errors;
  }

  formatCommitMessage(type, scope, subject, body, footer, isBreaking) {
    let message = '';

    // Header
    const breakingIndicator = isBreaking ? '!' : '';
    const scopePart = scope ? `(${scope})` : '';
    message += `${type}${scopePart}${breakingIndicator}: ${subject}`;

    // Body
    if (body) {
      message += `\n\n${body}`;
    }

    // Footer
    if (footer) {
      message += `\n\n${footer}`;
    }

    return message;
  }

  async getCommitInfo() {
    console.log('🎯 Interactive Commit Message Creator');
    console.log('=====================================\n');

    // Select type
    const type = await this.selectFromOptions(COMMIT_TYPES, '📝 Select commit type');
    const typeInfo = COMMIT_TYPES[type];

    console.log(`\n✅ Selected: ${typeInfo.emoji} ${type} - ${typeInfo.description}`);
    if (typeInfo.version !== 'none') {
      console.log(`📈 Version impact: ${typeInfo.version}`);
    }

    // Select scope
    const useScope = await this.askQuestion('\n❓ Add scope? (y/N): ');
    let scope = '';
    if (useScope.toLowerCase() === 'y' || useScope.toLowerCase() === 'yes') {
      scope = await this.selectFromOptions(SCOPES, '🎯 Select scope', true);
      if (SCOPES[scope]) {
        console.log(`\n✅ Selected scope: ${SCOPES[scope].emoji} ${scope} - ${SCOPES[scope].description}`);
      } else {
        console.log(`\n✅ Custom scope: ${scope}`);
      }
    }

    // Get subject
    let subject = '';
    while (true) {
      subject = await this.askQuestion('\n📝 Enter subject (what does this commit do?): ');
      const errors = this.validateSubject(subject);

      if (errors.length === 0) {
        break;
      }

      console.log('\n❌ Subject validation errors:');
      errors.forEach(error => console.log(`   • ${error}`));
      console.log('\n💡 Use imperative mood: "add feature" not "added feature"');
    }

    // Check for breaking changes
    const isBreakingInput = await this.askQuestion('\n⚠️  Is this a breaking change? (y/N): ');
    const isBreaking = isBreakingInput.toLowerCase() === 'y' || isBreakingInput.toLowerCase() === 'yes';

    // Get body (optional)
    const addBody = await this.askQuestion('\n📄 Add detailed description? (y/N): ');
    let body = '';
    if (addBody.toLowerCase() === 'y' || addBody.toLowerCase() === 'yes') {
      console.log('\n📝 Enter body (press Enter twice to finish):');
      const bodyLines = [];
      while (true) {
        const line = await this.askQuestion('   ');
        if (line === '' && bodyLines.length > 0) break;
        if (line !== '') bodyLines.push(line);
      }
      body = bodyLines.join('\n');
    }

    // Get footer (for breaking changes or issues)
    let footer = '';
    if (isBreaking) {
      footer = await this.askQuestion('\n⚠️  Describe the breaking change: ');
      footer = `BREAKING CHANGE: ${footer}`;
    } else {
      const addFooter = await this.askQuestion('\n🔗 Add footer (issues, etc.)? (y/N): ');
      if (addFooter.toLowerCase() === 'y' || addFooter.toLowerCase() === 'yes') {
        footer = await this.askQuestion('   Enter footer: ');
      }
    }

    return { type, scope, subject, body, footer, isBreaking };
  }

  async createCommit() {
    try {
      const commitInfo = await this.getCommitInfo();
      const message = this.formatCommitMessage(
        commitInfo.type,
        commitInfo.scope,
        commitInfo.subject,
        commitInfo.body,
        commitInfo.footer,
        commitInfo.isBreaking
      );

      console.log('\n📋 Generated commit message:');
      console.log('─'.repeat(50));
      console.log(message);
      console.log('─'.repeat(50));

      const confirm = await this.askQuestion('\n✅ Create this commit? (Y/n): ');

      if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
        console.log('❌ Commit cancelled');
        return false;
      }

      // Check if there are staged files
      try {
        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
        if (!stagedFiles.trim()) {
          console.log('\n⚠️  No staged files found. Stage files first:');
          console.log('   git add <files>');
          return false;
        }
      } catch (error) {
        console.log('\n⚠️  Could not check staged files. Make sure you\'re in a git repository.');
        return false;
      }

      // Create commit
      try {
        execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
        console.log('\n🎉 Commit created successfully!');

        // Show next steps
        console.log('\n📝 Next steps:');
        console.log('   • Push changes: git push');
        console.log('   • Create PR: gh pr create (if using GitHub CLI)');
        console.log('   • View log: git log --oneline -5');

        return true;
      } catch (error) {
        console.error('\n❌ Failed to create commit:', error.message);
        return false;
      }

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      return false;
    } finally {
      this.rl.close();
    }
  }
}

// Main execution
if (require.main === module) {
  const commitHelper = new CommitHelper();
  commitHelper.createCommit().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = CommitHelper;
