#!/usr/bin/env node

/**
 * Automatic Release Notes Generator
 * Generates comprehensive release notes from conventional commits
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ReleaseNotesGenerator {
  constructor() {
    this.packagePath = path.join(process.cwd(), 'package.json');
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    this.releaseNotesPath = path.join(process.cwd(), 'RELEASE_NOTES.md');
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
   * Get previous version tag
   */
  getPreviousVersion() {
    try {
      const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.match(/^v?\d+\.\d+\.\d+$/));

      return tags.length > 0 ? tags[0] : null;
    } catch (error) {
      console.warn('Could not get previous version:', error.message);
      return null;
    }
  }

  /**
   * Get commits between versions
   */
  getCommitsSinceLastRelease(fromTag = null) {
    try {
      const command = fromTag
        ? `git log ${fromTag}..HEAD --oneline --format="%H|%s|%an|%ad" --date=short`
        : 'git log --oneline --format="%H|%s|%an|%ad" --date=short -20';

      const output = execSync(command, { encoding: 'utf8' }).trim();

      if (!output) return [];

      return output.split('\n').map(line => {
        const [hash, subject, author, date] = line.split('|');
        return { hash: hash.substring(0, 8), subject, author, date };
      });
    } catch (error) {
      console.warn('Could not get commits:', error.message);
      return [];
    }
  }

  /**
   * Parse conventional commit
   */
  parseConventionalCommit(subject) {
    const match = subject.match(/^([a-z]+)(\(([^)]+)\))?(!)?\s*:\s*(.+)$/);
    if (!match) return null;

    const [, type, , scope, breaking, description] = match;

    return {
      type,
      scope: scope || null,
      breaking: !!breaking,
      description,
      category: this.getCategoryForType(type),
      emoji: this.getEmojiForType(type),
      versionImpact: this.getVersionImpact(type, breaking)
    };
  }

  /**
   * Get category for commit type
   */
  getCategoryForType(type) {
    const categories = {
      feat: 'Features',
      fix: 'Bug Fixes',
      perf: 'Performance Improvements',
      docs: 'Documentation',
      style: 'Code Style',
      refactor: 'Code Refactoring',
      test: 'Tests',
      chore: 'Chores',
      ci: 'CI/CD',
      build: 'Build System',
      revert: 'Reverts'
    };
    return categories[type] || 'Other Changes';
  }

  /**
   * Get emoji for commit type
   */
  getEmojiForType(type) {
    const emojis = {
      feat: '✨',
      fix: '🐛',
      perf: '⚡',
      docs: '📚',
      style: '💎',
      refactor: '♻️',
      test: '🧪',
      chore: '🔧',
      ci: '👷',
      build: '📦',
      revert: '⏪'
    };
    return emojis[type] || '📝';
  }

  /**
   * Get version impact
   */
  getVersionImpact(type, breaking) {
    if (breaking) return 'major';
    if (type === 'feat') return 'minor';
    if (['fix', 'perf', 'revert'].includes(type)) return 'patch';
    return 'none';
  }

  /**
   * Group commits by category
   */
  groupCommitsByCategory(commits) {
    const grouped = {};
    const breakingChanges = [];

    commits.forEach(commit => {
      const parsed = this.parseConventionalCommit(commit.subject);
      if (!parsed) {
        // Handle non-conventional commits
        if (!grouped['Other Changes']) {
          grouped['Other Changes'] = [];
        }
        grouped['Other Changes'].push({
          ...commit,
          emoji: '📝',
          description: commit.subject,
          scope: null
        });
        return;
      }

      const category = parsed.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }

      const commitInfo = {
        ...commit,
        ...parsed,
        description: parsed.description
      };

      grouped[category].push(commitInfo);

      // Track breaking changes separately
      if (parsed.breaking || commit.subject.includes('BREAKING CHANGE')) {
        breakingChanges.push(commitInfo);
      }
    });

    return { grouped, breakingChanges };
  }

  /**
   * Generate contributors list
   */
  getContributors(commits) {
    const contributors = new Map();

    commits.forEach(commit => {
      const author = commit.author;
      if (contributors.has(author)) {
        contributors.set(author, contributors.get(author) + 1);
      } else {
        contributors.set(author, 1);
      }
    });

    return Array.from(contributors.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([author, count]) => ({ author, count }));
  }

  /**
   * Get release statistics
   */
  getReleaseStats(commits, grouped) {
    const stats = {
      totalCommits: commits.length,
      contributors: this.getContributors(commits).length,
      categories: Object.keys(grouped).length,
      features: grouped['Features']?.length || 0,
      bugFixes: grouped['Bug Fixes']?.length || 0,
      performance: grouped['Performance Improvements']?.length || 0,
      breaking: 0
    };

    // Count breaking changes
    commits.forEach(commit => {
      if (commit.subject.includes('!:') || commit.subject.includes('BREAKING CHANGE')) {
        stats.breaking++;
      }
    });

    return stats;
  }

  /**
   * Generate release notes content
   */
  generateReleaseNotes(version, fromTag = null) {
    const commits = this.getCommitsSinceLastRelease(fromTag);

    if (commits.length === 0) {
      return this.generateEmptyReleaseNotes(version);
    }

    const { grouped, breakingChanges } = this.groupCommitsByCategory(commits);
    const contributors = this.getContributors(commits);
    const stats = this.getReleaseStats(commits, grouped);
    const releaseDate = new Date().toISOString().split('T')[0];

    let content = '';

    // Header
    content += `# Release Notes - v${version}\n\n`;
    content += `**Release Date:** ${releaseDate}\n\n`;

    // Quick Stats
    content += `## 📊 Release Statistics\n\n`;
    content += `- **Total Commits:** ${stats.totalCommits}\n`;
    content += `- **Contributors:** ${stats.contributors}\n`;
    content += `- **New Features:** ${stats.features}\n`;
    content += `- **Bug Fixes:** ${stats.bugFixes}\n`;
    content += `- **Performance Improvements:** ${stats.performance}\n`;
    if (stats.breaking > 0) {
      content += `- **⚠️ Breaking Changes:** ${stats.breaking}\n`;
    }
    content += '\n';

    // Breaking Changes (if any)
    if (breakingChanges.length > 0) {
      content += `## ⚠️ Breaking Changes\n\n`;
      content += `> **Important:** This release contains breaking changes. Please review the migration guide below.\n\n`;

      breakingChanges.forEach(commit => {
        const scopeText = commit.scope ? `**${commit.scope}:** ` : '';
        content += `- ${commit.emoji} ${scopeText}${commit.description} ([${commit.hash}](../../commit/${commit.hash}))\n`;
      });
      content += '\n';
    }

    // Category sections
    const priorityOrder = [
      'Features',
      'Bug Fixes',
      'Performance Improvements',
      'Documentation',
      'Code Refactoring',
      'Tests',
      'Code Style',
      'CI/CD',
      'Build System',
      'Chores',
      'Reverts',
      'Other Changes'
    ];

    priorityOrder.forEach(category => {
      if (grouped[category] && grouped[category].length > 0) {
        const emoji = grouped[category][0].emoji;
        content += `## ${emoji} ${category}\n\n`;

        grouped[category].forEach(commit => {
          const scopeText = commit.scope ? `**${commit.scope}:** ` : '';
          content += `- ${scopeText}${commit.description} ([${commit.hash}](../../commit/${commit.hash}))\n`;
        });
        content += '\n';
      }
    });

    // Contributors
    if (contributors.length > 0) {
      content += `## 👥 Contributors\n\n`;
      content += `Thank you to all contributors who made this release possible:\n\n`;

      contributors.forEach(({ author, count }) => {
        const commits = count === 1 ? 'commit' : 'commits';
        content += `- **${author}** (${count} ${commits})\n`;
      });
      content += '\n';
    }

    // Installation
    content += `## 📦 Installation\n\n`;
    content += '```bash\n';
    content += `npm install rm-ng-typeahead@${version}\n`;
    content += '# or\n';
    content += `yarn add rm-ng-typeahead@${version}\n`;
    content += '```\n\n';

    // Upgrade Guide (if breaking changes)
    if (breakingChanges.length > 0) {
      content += `## 🔧 Migration Guide\n\n`;
      content += `This release contains breaking changes. Follow these steps to upgrade:\n\n`;
      content += `1. **Update your package:**\n`;
      content += `   \`\`\`bash\n`;
      content += `   npm install rm-ng-typeahead@${version}\n`;
      content += `   \`\`\`\n\n`;
      content += `2. **Review breaking changes above and update your code accordingly**\n\n`;
      content += `3. **Run your tests to ensure compatibility**\n\n`;
      content += `4. **Check the updated documentation for new features**\n\n`;
    }

    // Links
    content += `## 🔗 Links\n\n`;
    content += `- [📖 Full Changelog](../../compare/v${fromTag || '0.0.0'}...v${version})\n`;
    content += `- [📚 Documentation](../../README.md)\n`;
    content += `- [🚀 Demo](https://your-demo-url.com)\n`;
    content += `- [🐛 Report Issues](../../issues)\n`;
    content += `- [💬 Discussions](../../discussions)\n\n`;

    // Footer
    content += `---\n\n`;
    content += `**Full Changelog:** [v${fromTag || '0.0.0'}...v${version}](../../compare/v${fromTag || '0.0.0'}...v${version})\n`;

    return content;
  }

  /**
   * Generate empty release notes
   */
  generateEmptyReleaseNotes(version) {
    const releaseDate = new Date().toISOString().split('T')[0];

    return `# Release Notes - v${version}

**Release Date:** ${releaseDate}

## 📝 Changes

This release contains maintenance updates and dependency upgrades.

## 📦 Installation

\`\`\`bash
npm install rm-ng-typeahead@${version}
# or
yarn add rm-ng-typeahead@${version}
\`\`\`

---

**Full Changelog:** [View on GitHub](../../releases/tag/v${version})
`;
  }

  /**
   * Save release notes to file
   */
  saveReleaseNotes(content) {
    fs.writeFileSync(this.releaseNotesPath, content, 'utf8');
    console.log(`✅ Release notes saved to ${this.releaseNotesPath}`);
  }

  /**
   * Generate and save release notes
   */
  generate(options = {}) {
    const { version, fromTag, save = true } = options;

    try {
      const currentVersion = version || this.getCurrentVersion();
      const previousTag = fromTag || this.getPreviousVersion();

      console.log(`📝 Generating release notes for v${currentVersion}...`);
      if (previousTag) {
        console.log(`📊 Analyzing changes since ${previousTag}`);
      }

      const content = this.generateReleaseNotes(currentVersion, previousTag);

      if (save) {
        this.saveReleaseNotes(content);
      }

      return content;

    } catch (error) {
      console.error('❌ Error generating release notes:', error.message);
      throw error;
    }
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const version = args.find(arg => arg.match(/^\d+\.\d+\.\d+$/));
  const fromTag = args.find(arg => arg.startsWith('--from='))?.split('=')[1];
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
📝 Release Notes Generator

Usage:
  node generate-release-notes.js [version] [options]

Options:
  --from=<tag>     # Generate from specific tag
  --dry-run        # Show output without saving
  --help, -h       # Show this help

Examples:
  node generate-release-notes.js 1.2.0
  node generate-release-notes.js --from=v1.1.0
  node generate-release-notes.js 1.2.0 --dry-run
    `);
    return;
  }

  const generator = new ReleaseNotesGenerator();

  try {
    const content = generator.generate({
      version,
      fromTag,
      save: !dryRun
    });

    if (dryRun) {
      console.log('\n📋 Release Notes Preview:');
      console.log('─'.repeat(50));
      console.log(content);
      console.log('─'.repeat(50));
    }

  } catch (error) {
    console.error('❌ Failed to generate release notes');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ReleaseNotesGenerator;
