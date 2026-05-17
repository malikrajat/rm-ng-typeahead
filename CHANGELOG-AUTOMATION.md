# Changelog Automation Guide

This guide explains how to use the automated changelog and release system for the RM Angular Typeahead project.

## 🚀 Overview

Our project uses **Conventional Commits** and automated tooling to:
- ✅ Generate changelogs automatically from commit messages
- ✅ Determine semantic version bumps automatically
- ✅ Create releases with proper tagging
- ✅ Validate commit message format
- ✅ Automate the entire release process

## 📋 Conventional Commit Format

### Basic Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types
| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New features | Minor |
| `fix` | Bug fixes | Patch |
| `docs` | Documentation only | None |
| `style` | Code style (formatting, etc) | None |
| `refactor` | Code refactoring | None |
| `perf` | Performance improvements | Patch |
| `test` | Test additions/modifications | None |
| `chore` | Build process or tool changes | None |
| `ci` | CI configuration changes | None |
| `build` | Build system changes | None |
| `revert` | Revert previous commits | Patch |

### Scopes
| Scope | Description |
|-------|-------------|
| `typeahead` | Main typeahead component |
| `chips` | Chip/tag functionality |
| `search` | Search functionality |
| `accessibility` | Accessibility features |
| `performance` | Performance optimizations |
| `styling` | CSS and theming |
| `forms` | Form integration |
| `config` | Configuration system |
| `docs` | Documentation |
| `demo` | Demo application |
| `build` | Build system |
| `deps` | Dependencies |
| `release` | Release management |

### Breaking Changes
For breaking changes, add `!` after the type/scope or include `BREAKING CHANGE:` in the footer:

```bash
# Method 1: Exclamation mark
feat(typeahead)!: remove deprecated multiSelect property

# Method 2: Footer
feat(chips): add new chip removal API

BREAKING CHANGE: The old `removeChip()` method has been replaced with `removeSelection()`
```

## 📝 Commit Examples

### ✅ Good Commits
```bash
# New feature
feat(typeahead): add virtual scrolling support for large datasets

# Bug fix
fix(search): resolve race condition in async search requests

# Performance improvement
perf(chips): optimize chip rendering for large selections

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(config)!: restructure configuration object for better type safety

BREAKING CHANGE: The `inputConfig` property has been split into `searchConfig` and `displayConfig`
```

### ❌ Bad Commits
```bash
# Too vague
fix: bug fixes

# No scope when needed
feat: add feature

# Wrong format
Add new search functionality

# Missing description
feat(search):
```

## 🛠️ Local Development Workflow

### 1. Making Commits
Use the interactive commit tool for consistent formatting:

```bash
# Install dependencies (includes commitizen)
npm install

# Make your changes
git add .

# Use interactive commit (recommended)
npm run commit
# or
npx git-cz

# Or manual commit (ensure format is correct)
git commit -m "feat(typeahead): add keyboard navigation support"
```

### 2. Pre-commit Hooks
The project automatically runs these checks before each commit:
- **Prettier** - Code formatting
- **ESLint** - Code linting and fixes
- **Commitlint** - Validates commit message format

### 3. Generating Changelog Locally
```bash
# Generate complete changelog
npm run changelog:generate

# Update changelog with new commits
npm run changelog:update

# Validate changelog format
node scripts/generate-changelog.js validate
```

## 🚀 Release Process

### Automated Releases (Recommended)

#### 1. GitHub Actions (Automatic)
Releases are triggered automatically when commits are pushed to `main`:

```bash
git push origin main
```

The system will:
- ✅ Analyze commits to determine version bump
- ✅ Generate changelog
- ✅ Run tests and build
- ✅ Create git tag
- ✅ Publish to npm
- ✅ Create GitHub release
- ✅ Deploy demo to GitHub Pages

#### 2. Manual GitHub Actions
Trigger releases manually with specific version type:

1. Go to **Actions** tab in GitHub
2. Select **Release Automation** workflow
3. Click **Run workflow**
4. Choose release type (patch/minor/major)
5. Optionally enable dry-run mode

### Local Releases

#### Quick Releases
```bash
# Patch release (1.0.0 → 1.0.1)
npm run version:patch

# Minor release (1.0.0 → 1.1.0)
npm run version:minor

# Major release (1.0.0 → 2.0.0)
npm run version:major
```

#### Full Release Process
```bash
# Patch release with full automation
node scripts/release.js patch

# Minor release (dry-run first)
node scripts/release.js minor --dry-run
node scripts/release.js minor

# Major release skipping tests
node scripts/release.js major --skip-tests

# Release without publishing
node scripts/release.js patch --skip-publish
```

### Release Script Options
| Option | Description |
|--------|-------------|
| `--dry-run` | Run without making actual changes |
| `--skip-tests` | Skip running tests and linting |
| `--skip-publish` | Skip npm publishing |

## 📊 Version Bump Rules

The system automatically determines version bumps based on commit types:

| Commit Pattern | Version Bump | Example |
|----------------|--------------|---------|
| `feat:` commits | **Minor** | 1.0.0 → 1.1.0 |
| `fix:`, `perf:` commits | **Patch** | 1.0.0 → 1.0.1 |
| `BREAKING CHANGE:` or `!` | **Major** | 1.0.0 → 2.0.0 |
| Only `docs:`, `style:`, `test:`, `chore:` | **No bump** | - |

## 🔍 Validation and Quality Gates

### Pre-commit Validation
- ✅ **Prettier** formatting
- ✅ **ESLint** linting with auto-fix
- ✅ **Commitlint** message validation

### Pre-release Validation
- ✅ **Unit tests** with coverage
- ✅ **Library build** validation
- ✅ **Demo build** validation
- ✅ **Changelog** format validation
- ✅ **Git status** checks

### CI/CD Pipeline
- ✅ **Multi-Node testing** (Node 18, 20)
- ✅ **Cross-platform testing** (Ubuntu, Windows, macOS)
- ✅ **Coverage reporting** via Codecov
- ✅ **Security scanning** for vulnerabilities
- ✅ **Bundle analysis** for size optimization

## 📚 Troubleshooting

### Common Issues

#### Commit Message Rejected
```bash
# Error: commit message doesn't follow conventional format
# Solution: Use the interactive tool
npm run commit
```

#### Changelog Generation Failed
```bash
# Check if you have conventional commits
git log --oneline

# Generate changelog manually
node scripts/generate-changelog.js generate
```

#### Release Failed
```bash
# Run dry-run first to check issues
node scripts/release.js patch --dry-run

# Check git status
git status

# Ensure you're on main branch
git checkout main
```

#### Pre-commit Hooks Not Working
```bash
# Reinstall husky
npm run prepare

# Check hook files exist
ls -la .husky/
```

### Getting Help

1. **Check the logs** - All scripts provide detailed output
2. **Validate your setup** - Run `npm run validate` (if available)
3. **Use dry-run mode** - Test changes without side effects
4. **Check GitHub Actions** - View detailed CI/CD logs

## 🎯 Best Practices

### Commit Practices
- ✅ **Make atomic commits** - One logical change per commit
- ✅ **Write clear descriptions** - Explain what and why, not how
- ✅ **Use appropriate scopes** - Be specific about affected areas
- ✅ **Include issue numbers** - Reference related issues
- ✅ **Test before committing** - Ensure changes work

### Release Practices
- ✅ **Use semantic versioning** - Follow semver principles
- ✅ **Test releases** - Always use dry-run first
- ✅ **Document breaking changes** - Provide migration guides
- ✅ **Review changelog** - Ensure accuracy before publishing
- ✅ **Monitor releases** - Check npm and GitHub after publishing

### Collaboration Practices
- ✅ **Review commit messages** - During code reviews
- ✅ **Discuss breaking changes** - Before implementation
- ✅ **Update documentation** - Keep README current
- ✅ **Communicate releases** - Notify team of new versions

## 📈 Metrics and Monitoring

### Release Metrics
Track these metrics for process improvement:
- **Time to release** - From commit to published
- **Release frequency** - How often we release
- **Rollback rate** - Failed releases requiring fixes
- **Adoption rate** - How quickly users upgrade

### Changelog Quality
- **Completeness** - All changes documented
- **Accuracy** - Descriptions match actual changes  
- **Usefulness** - Helps users understand impact
- **Consistency** - Follows established format

---

## 🎉 Quick Start Checklist

- [ ] Install dependencies: `npm install`
- [ ] Make changes to code
- [ ] Add and test changes: `npm test`
- [ ] Commit with conventional format: `npm run commit`
- [ ] Push to trigger automated release: `git push origin main`
- [ ] Monitor GitHub Actions for release progress
- [ ] Verify release on npm and GitHub
- [ ] Update documentation if needed

**Happy releasing! 🚀**
