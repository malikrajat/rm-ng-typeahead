module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New features
        'fix',      // Bug fixes
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Test additions/modifications
        'chore',    // Build process or auxiliary tool changes
        'ci',       // CI configuration changes
        'build',    // Changes to build system
        'revert'    // Revert previous commits
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'typeahead',      // Main typeahead component
        'chips',          // Chip/tag functionality
        'search',         // Search functionality
        'accessibility',  // Accessibility features
        'performance',    // Performance optimizations
        'styling',        // CSS and theming
        'forms',          // Form integration
        'config',         // Configuration system
        'docs',           // Documentation
        'demo',           // Demo application
        'build',          // Build system
        'deps',           // Dependencies
        'release'         // Release management
      ]
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100]
  }
};
