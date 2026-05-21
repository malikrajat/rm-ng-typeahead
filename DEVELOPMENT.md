# Development Guide

This guide provides comprehensive information for developers working on the rm-ng-typeahead project.

## 🏗️ Project Architecture

### Library Structure
```
projects/rm-ng-typeahead/
├── src/
│   ├── lib/                    # Library source
│   │   ├── interfaces/         # TypeScript interfaces
│   │   ├── typeahead/         # Main component
│   │   │   ├── typeahead.ts   # Component logic
│   │   │   ├── typeahead.html # Template
│   │   │   └── typeahead.css  # Styles
│   │   └── rm-ng-typeahead.ts # Library entry
│   ├── public-api.ts          # Public exports
│   └── test.ts               # Test setup
├── ng-package.json           # Build configuration
└── package.json             # Library package config
```

### Demo Application
```
src/
├── app/
│   ├── app.component.ts      # Demo component
│   ├── app.component.html    # Demo template
│   ├── app.component.scss    # Demo styles
│   └── main.ts              # Bootstrap
├── assets/                   # Static assets
├── styles.scss              # Global styles
└── index.html               # Main HTML
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0+ 
- npm 9.0+
- Angular CLI 20.0+
- Git 2.0+

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-username/rm-ng-typeahead.git
cd rm-ng-typeahead

# Install dependencies
npm install

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli@latest

# Verify installation
ng version
```

### Development Environment
```bash
# Start development server
npm run start
# or
ng serve

# Build library for development
npm run build:lib
# or
ng build rm-ng-typeahead

# Build demo application
npm run build
# or
ng build

# Run tests
npm test
# or
ng test

# Run linting
npm run lint
# or
ng lint
```

## 🧪 Testing Strategy

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
ng test --include="**/typeahead.component.spec.ts"
```

### E2E Tests (Optional)
```bash
# Install E2E testing
ng add @angular/e2e

# Run E2E tests
npm run e2e
```

### Testing Best Practices
- Write tests for all public methods
- Test both success and error scenarios
- Mock external dependencies
- Use Angular Testing Utilities
- Maintain >90% code coverage

### Test Structure
```typescript
describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadComponent],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // More tests...
});
```

## 🏗️ Build Process

### Library Build
```bash
# Development build
ng build rm-ng-typeahead

# Production build
ng build rm-ng-typeahead --configuration production

# Build with watch mode
ng build rm-ng-typeahead --watch
```

### Demo Application Build
```bash
# Development build
ng build

# Production build
ng build --configuration production

# Analyze bundle
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/rm-ng-typeahead-main/stats.json
```

### Build Configuration
The library uses Angular's ng-packagr for building:

```json
// ng-package.json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/rm-ng-typeahead",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

## 📦 Publishing

### Pre-publish Checklist
- [ ] All tests passing
- [ ] Linting clean
- [ ] Documentation updated
- [ ] Version bumped
- [ ] CHANGELOG.md updated
- [ ] README.md reviewed
- [ ] Build successful

### Version Management
```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major

# Pre-release version
npm version prerelease --preid=beta
```

### Publishing Process
```bash
# Build the library
npm run build:lib

# Publish to npm
cd dist/rm-ng-typeahead
npm publish

# Or use automated script
npm run publish:lib
```

### Automated Publishing
The project uses GitHub Actions for automated publishing:

```yaml
# .github/workflows/release.yml
- name: Publish to NPM
  run: |
    cd dist/rm-ng-typeahead
    npm publish --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🎨 Code Style

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "@angular-eslint/recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@angular-eslint/no-empty-lifecycle-method": "error"
  }
}
```

### Prettier Configuration
```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `TypeaheadComponent`)
- **Files**: kebab-case (e.g., `typeahead.component.ts`)
- **Variables**: camelCase (e.g., `searchTerm`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_CONFIG`)
- **Interfaces**: PascalCase with 'I' prefix (e.g., `ITypeaheadConfig`)

## 🔧 Git Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: New features
- **bugfix/***: Bug fixes
- **hotfix/***: Critical fixes for production
- **release/***: Release preparation

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
```
feat(typeahead): add keyboard navigation support

Add arrow key navigation for dropdown options
- Up/Down arrows navigate between options
- Enter selects current option
- Escape closes dropdown

Closes #123
```

### Git Hooks
The project uses Husky for git hooks:

```bash
# Pre-commit: lint, format, test changed files
.husky/pre-commit

# Commit-msg: validate commit message format
.husky/commit-msg

# Pre-push: run full test suite
.husky/pre-push
```

## 🚨 Debugging

### Development Tools
```bash
# Angular DevTools
# Install browser extension for Angular debugging

# Source maps
# Enabled automatically in development mode

# Verbose logging
ng serve --verbose

# Debug build
ng build --configuration development --source-map
```

### Common Issues

#### Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
ng cache clean

# Check Angular version compatibility
ng update
```

#### Test Failures
```bash
# Run tests with verbose output
ng test --code-coverage --watch=false --browsers=ChromeHeadless

# Debug specific test
ng test --include="**/component.spec.ts" --source-map
```

#### Library Import Issues
```bash
# Rebuild library
ng build rm-ng-typeahead --watch

# Check public API exports
cat dist/rm-ng-typeahead/public-api.d.ts
```

## 🔍 Performance Optimization

### Bundle Analysis
```bash
# Build with stats
ng build --stats-json

# Analyze bundle
npx webpack-bundle-analyzer dist/rm-ng-typeahead-main/stats.json
```

### Optimization Techniques
- Use OnPush change detection
- Implement trackBy functions
- Lazy load modules when possible
- Optimize bundle size with tree shaking
- Use async pipes for observables
- Minimize DOM manipulations

### Performance Monitoring
```typescript
// Performance marks
performance.mark('typeahead-search-start');
// ... search logic
performance.mark('typeahead-search-end');
performance.measure('typeahead-search', 'typeahead-search-start', 'typeahead-search-end');
```

## 📊 Monitoring and Analytics

### Build Metrics
- Bundle size tracking
- Build time monitoring
- Test coverage reporting
- Code quality metrics

### Runtime Metrics
- Component render time
- Search response time
- Memory usage
- User interaction analytics

## 🔄 Continuous Integration

### GitHub Actions Workflows
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:ci
      - run: npm run build:lib
      - run: npm run build
```

### Quality Gates
- ✅ All tests pass
- ✅ Linting clean
- ✅ Code coverage >90%
- ✅ Build successful
- ✅ No security vulnerabilities

## 📝 Documentation

### Code Documentation
```typescript
/**
 * TypeaheadComponent provides autocomplete functionality
 * 
 * @example
 * ```html
 * <rm-typeahead 
 *   [options]="options"
 *   (optionSelected)="onSelect($event)">
 * </rm-typeahead>
 * ```
 */
@Component({
  selector: 'rm-typeahead',
  // ...
})
export class TypeaheadComponent {
  /**
   * Array of options to display in dropdown
   * @default []
   */
  @Input() options: TypeaheadOption[] = [];
}
```

### Generating Documentation
```bash
# Install Compodoc
npm install -g @compodoc/compodoc

# Generate documentation
compodoc -p tsconfig.json -s

# Generate for library only
compodoc -p projects/rm-ng-typeahead/tsconfig.lib.json -s
```

## 🤝 Contributing

### Development Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run quality checks
5. Submit pull request
6. Code review process
7. Merge to main

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered
- [ ] Accessibility maintained
- [ ] Browser compatibility verified

## 🆘 Getting Help

### Resources
- [Angular Documentation](https://angular.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular CLI Documentation](https://angular.io/cli)

### Support Channels
- GitHub Issues for bugs and feature requests
- Discussions for questions and ideas
- Stack Overflow for general Angular questions

### Common Commands Reference
```bash
# Development
npm start                 # Start dev server
npm run build:lib        # Build library
npm test                 # Run tests
npm run lint             # Lint code

# Release
npm version patch        # Bump version
npm run release:notes    # Generate release notes
npm run publish:lib      # Publish to npm

# Maintenance
npm run format           # Format code
npm run clean            # Clean build artifacts
npm update               # Update dependencies
```

This development guide should help team members get up to speed quickly and maintain consistent development practices across the project.
