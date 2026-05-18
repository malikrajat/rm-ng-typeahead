# Commit Message Examples & Best Practices

This guide provides comprehensive examples of proper commit messages for the RM Angular Typeahead project.

## 🎯 **Fixed Format Structure**

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### **Rules:**
- ✅ Subject line: **maximum 72 characters**
- ✅ Body lines: **maximum 100 characters**
- ✅ Use **imperative mood** ("add" not "added", "fix" not "fixed")
- ✅ **No period** at end of subject
- ✅ **Lowercase** subject line
- ✅ Separate subject from body with **blank line**

---

## 📝 **Commit Examples by Type**

### **✨ feat - New Features (Minor Version Bump)**
```bash
# Basic feature
feat(typeahead): add virtual scrolling support

# Feature with scope and body
feat(chips): add custom chip templates

Allows users to provide custom templates for chip rendering
with full type safety and accessibility support.

Closes #123

# Breaking change feature
feat(config)!: restructure configuration object

BREAKING CHANGE: The inputConfig property has been split into
searchConfig and displayConfig for better type safety and clarity.

Migration: Replace inputConfig with searchConfig and displayConfig
```

### **🐛 fix - Bug Fixes (Patch Version Bump)**
```bash
# Simple bug fix
fix(search): resolve race condition in async requests

# Bug fix with details
fix(accessibility): correct ARIA announcements for chip removal

Fixed issue where screen readers weren't properly announcing
when chips were removed from multi-select mode.

Fixes #456

# Critical bug fix
fix(performance): prevent memory leak in virtual scrolling

The virtual scroll component was not properly cleaning up
subscriptions when destroyed, causing memory leaks in
single-page applications.
```

### **📚 docs - Documentation Changes (No Version Bump)**
```bash
# README updates
docs(readme): update installation instructions

# API documentation
docs(typeahead): add JSDoc comments for public methods

# Guide updates
docs(examples): add form integration examples
```

### **💎 style - Code Style/Formatting (No Version Bump)**
```bash
# Formatting changes
style(typeahead): fix indentation and spacing

# Code style improvements
style: apply prettier formatting to all files

# CSS organization
style(styling): reorganize CSS custom properties
```

### **♻️ refactor - Code Refactoring (No Version Bump)**
```bash
# Component refactoring
refactor(search): extract search logic into separate service

# Code organization
refactor(chips): simplify chip rendering logic

# Type improvements
refactor(types): improve TypeScript type definitions
```

### **⚡ perf - Performance Improvements (Patch Version Bump)**
```bash
# Performance optimization
perf(virtual-scroll): optimize rendering for large datasets

# Memory optimization
perf(chips): reduce memory usage in chip tracking

# Search optimization
perf(search): implement request deduplication and caching
```

### **🧪 test - Test Changes (No Version Bump)**
```bash
# New tests
test(typeahead): add unit tests for keyboard navigation

# Test improvements
test(accessibility): add comprehensive a11y test suite

# Test fixes
test(search): fix flaky async search tests
```

### **🔧 chore - Build/Tool Changes (No Version Bump)**
```bash
# Dependency updates
chore(deps): update Angular to version 20.2.3

# Build configuration
chore(build): optimize webpack bundle configuration

# Tool configuration
chore(lint): update ESLint rules for better code quality
```

### **👷 ci - CI Configuration (No Version Bump)**
```bash
# GitHub Actions
ci: add automated release workflow

# Build pipeline
ci(build): add parallel testing for multiple Node versions

# Deployment
ci(deploy): automate demo deployment to GitHub Pages
```

### **📦 build - Build System Changes (No Version Bump)**
```bash
# Build configuration
build: update ng-packagr configuration for library

# Bundle optimization
build(webpack): implement code splitting for demo app

# Tool updates
build(angular): migrate to Angular 20 build system
```

### **⏪ revert - Revert Changes (Patch Version Bump)**
```bash
# Simple revert
revert: "feat(search): add experimental fuzzy search"

This reverts commit abc123def456 due to performance issues.

# Revert with explanation
revert(performance): remove aggressive caching optimization

The caching optimization introduced in commit def456abc123
caused memory leaks in certain scenarios.
```

---

## 🎯 **Scope Examples by Component**

### **typeahead** - Main Component
```bash
feat(typeahead): add keyboard navigation support
fix(typeahead): resolve focus management issues
perf(typeahead): optimize change detection strategy
```

### **chips** - Chip/Tag Functionality
```bash
feat(chips): add animated chip removal
fix(chips): correct chip overflow handling
style(chips): improve chip visual design
```

### **search** - Search Functionality
```bash
feat(search): implement search term highlighting
fix(search): prevent duplicate search requests
perf(search): add intelligent request cancellation
```

### **accessibility** - A11y Features
```bash
feat(accessibility): add screen reader announcements
fix(accessibility): correct keyboard navigation
test(accessibility): add comprehensive a11y tests
```

### **performance** - Performance Optimizations
```bash
perf(performance): implement virtual scrolling
perf(performance): optimize large dataset handling
test(performance): add performance benchmarks
```

### **styling** - CSS and Theming
```bash
feat(styling): add dark theme support
fix(styling): correct high contrast mode colors
docs(styling): document CSS custom properties
```

### **forms** - Form Integration
```bash
feat(forms): add reactive forms integration
fix(forms): resolve validation state handling
test(forms): add form integration tests
```

### **config** - Configuration System
```bash
feat(config): add runtime configuration updates
fix(config): validate configuration object
docs(config): document all configuration options
```

### **demo** - Demo Application
```bash
feat(demo): add interactive examples
fix(demo): resolve demo app build issues
docs(demo): improve demo documentation
```

### **build** - Build System
```bash
chore(build): update build dependencies
fix(build): resolve library build warnings
ci(build): add automated build validation
```

---

## ⚠️ **Breaking Changes Format**

### **Method 1: Exclamation Mark**
```bash
feat(typeahead)!: remove deprecated multiSelect property

The multiSelect property has been replaced with mode="multiple"
for better consistency with HTML standards.

Migration:
- Replace [multiSelect]="true" with mode="multiple"
- Update TypeScript types accordingly
```

### **Method 2: Footer**
```bash
feat(config): restructure configuration interface

Added new searchConfig and displayConfig properties for
better organization and type safety.

BREAKING CHANGE: The inputConfig property has been split into
searchConfig and displayConfig. Update your configuration objects
to use the new structure.

Before: { inputConfig: { placeholder: "...", debounceTime: 300 } }
After: { 
  searchConfig: { debounceTime: 300 },
  displayConfig: { placeholder: "..." }
}
```

---

## 🔗 **Footer Examples**

### **Issue References**
```bash
fix(search): resolve timeout handling

Fixes #123
Closes #456
Resolves #789
```

### **Multiple Issues**
```bash
feat(accessibility): improve keyboard navigation

Implements feature request from #123
Addresses accessibility concerns in #456
Closes #789
```

### **Co-authored Commits**
```bash
feat(chips): add drag-and-drop reordering

Co-authored-by: John Doe <john@example.com>
Co-authored-by: Jane Smith <jane@example.com>
```

### **Review References**
```bash
fix(performance): optimize virtual scrolling

Reviewed-by: Senior Developer <senior@example.com>
Tested-by: QA Team <qa@example.com>
```

---

## 🚀 **Complex Example**

```bash
feat(typeahead): add multi-select mode with professional chips

Implements comprehensive multi-select functionality with:
- Visual chip interface with customizable themes
- Keyboard navigation for chip management
- Screen reader support for accessibility
- Configurable selection limits and overflow handling
- Smooth animations and hover effects

The feature includes:
- 8 built-in chip color themes
- 3 size variants (small, medium, large)
- Compact mode for space-efficient display
- Full TypeScript type safety
- Comprehensive test coverage

Performance optimizations:
- Efficient chip rendering with OnPush detection
- Memory leak prevention in subscription cleanup
- Optimized change detection for large selections

Closes #123, #456, #789
Implements RFC-001
Reviewed-by: UI/UX Team <design@example.com>
Tested-by: Accessibility Team <a11y@example.com>

Co-authored-by: Design Lead <design@example.com>
```

---

## 🛠️ **Available Commit Tools**

### **Interactive Tools**
```bash
# Commitizen (guided prompts)
npm run commit

# Custom interactive helper (detailed)
npm run commit:interactive

# Git template (in editor)
npm run commit:template
git commit

# Help
npm run commit:help
```

### **Validation**
All commits are automatically validated for:
- ✅ Conventional commit format
- ✅ Type and scope validation
- ✅ Subject length (max 72 chars)
- ✅ Body line length (max 100 chars)
- ✅ Case sensitivity rules
- ✅ Imperative mood

### **Pre-commit Hooks**
- ✅ **Prettier** - Code formatting
- ✅ **ESLint** - Code linting with auto-fix
- ✅ **Commitlint** - Message validation

---

## 📈 **Version Impact**

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | **Minor** | 1.0.0 → 1.1.0 |
| `fix:`, `perf:` | **Patch** | 1.0.0 → 1.0.1 |
| `BREAKING CHANGE:` or `!` | **Major** | 1.0.0 → 2.0.0 |
| `docs:`, `style:`, `test:`, `chore:` | **None** | No version change |

---

## ✅ **Quick Reference**

### **Most Common Patterns**
```bash
feat(typeahead): add [feature]
fix(search): resolve [issue]
docs(readme): update [section]
perf(chips): optimize [aspect]
test(accessibility): add [test-type] tests
chore(deps): update [dependency]
```

### **Git Commands**
```bash
# Stage files
git add .

# Interactive commit
npm run commit:interactive

# Check commit history
git log --oneline -10

# View commit details
git show HEAD

# Amend last commit
git commit --amend
```

Remember: **Good commit messages are essential for maintainability, automated releases, and team collaboration!** 🎯
