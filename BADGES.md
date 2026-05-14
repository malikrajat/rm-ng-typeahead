# Badge Configuration

This file documents all the badges used in the project and provides templates for easy updates.

## 🏷️ Current Badges

### Package Information
```markdown
![NPM Version](https://img.shields.io/npm/v/rm-ng-typeahead?style=for-the-badge&logo=npm&logoColor=white&label=NPM&labelColor=CB3837)
![NPM Downloads](https://img.shields.io/npm/dm/rm-ng-typeahead?style=for-the-badge&logo=npm&logoColor=white&label=Downloads&labelColor=CB3837)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/rm-ng-typeahead?style=for-the-badge&logo=webpack&logoColor=white&label=Bundle%20Size&labelColor=8DD6F9)
```

### Technology Stack
```markdown
![Angular](https://img.shields.io/badge/Angular-20.2.3+-red?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.0+-purple?style=for-the-badge&logo=reactivex&logoColor=white)
```

### Build and Quality
```markdown
![CI Status](https://img.shields.io/github/actions/workflow/status/your-username/rm-ng-typeahead/release.yml?branch=main&style=for-the-badge&logo=github&logoColor=white&label=CI/CD)
![Test Coverage](https://img.shields.io/codecov/c/github/your-username/rm-ng-typeahead?style=for-the-badge&logo=codecov&logoColor=white&label=Coverage)
![Code Quality](https://img.shields.io/codefactor/grade/github/your-username/rm-ng-typeahead?style=for-the-badge&logo=codefactor&logoColor=white&label=Code%20Quality)
```

### License and Community
```markdown
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=opensourceinitiative&logoColor=white)
![GitHub Stars](https://img.shields.io/github/stars/your-username/rm-ng-typeahead?style=for-the-badge&logo=github&logoColor=white&label=Stars)
![GitHub Forks](https://img.shields.io/github/forks/your-username/rm-ng-typeahead?style=for-the-badge&logo=github&logoColor=white&label=Forks)
```

### Compatibility and Support
```markdown
![Node Version](https://img.shields.io/node/v/rm-ng-typeahead?style=for-the-badge&logo=nodedotjs&logoColor=white&label=Node)
![Browser Support](https://img.shields.io/badge/Browsers-Chrome%2090%2B%20%7C%20Firefox%2088%2B%20%7C%20Safari%2014%2B%20%7C%20Edge%2090%2B-brightgreen?style=for-the-badge&logo=googlechrome)
![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-brightgreen?style=for-the-badge&logo=accessibilityalt&logoColor=white)
```

## 🔧 Badge Templates

### Dynamic Badges (Auto-updating)
Replace `your-username` and `rm-ng-typeahead` with actual values:

```markdown
<!-- NPM Package -->
![NPM Version](https://img.shields.io/npm/v/PACKAGE_NAME)
![NPM Downloads](https://img.shields.io/npm/dm/PACKAGE_NAME)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/PACKAGE_NAME)

<!-- GitHub Repository -->
![GitHub Stars](https://img.shields.io/github/stars/USERNAME/REPO_NAME)
![GitHub Forks](https://img.shields.io/github/forks/USERNAME/REPO_NAME)
![GitHub Issues](https://img.shields.io/github/issues/USERNAME/REPO_NAME)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/USERNAME/REPO_NAME)

<!-- CI/CD -->
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/USERNAME/REPO_NAME/release.yml)
![Codecov](https://img.shields.io/codecov/c/github/USERNAME/REPO_NAME)

<!-- Activity -->
![GitHub last commit](https://img.shields.io/github/last-commit/USERNAME/REPO_NAME)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/USERNAME/REPO_NAME)
```

### Static Badges
```markdown
<!-- Technology versions -->
![Angular](https://img.shields.io/badge/Angular-20.2.3+-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0+-green)

<!-- License -->
![License](https://img.shields.io/badge/License-MIT-green)

<!-- Browser compatibility -->
![Chrome](https://img.shields.io/badge/Chrome-90+-green)
![Firefox](https://img.shields.io/badge/Firefox-88+-orange)
![Safari](https://img.shields.io/badge/Safari-14+-blue)
![Edge](https://img.shields.io/badge/Edge-90+-blue)

<!-- Standards compliance -->
![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-green)
![Semantic Versioning](https://img.shields.io/badge/SemVer-2.0.0-brightgreen)
```

## 🎨 Color Schemes

### Brand Colors
- **NPM**: `#CB3837` (red)
- **TypeScript**: `#3178C6` (blue)
- **Angular**: `#DD0031` (red)
- **Node.js**: `#339933` (green)
- **GitHub**: `#181717` (dark)

### Status Colors
- **Passing/Success**: `#4c1` (bright green)
- **Failing/Error**: `#e05d44` (red)
- **Warning**: `#dfb317` (yellow)
- **Info**: `#007ec6` (blue)

### Quality Grades
- **A+**: `#4c1` (bright green)
- **A**: `#97ca00` (green)
- **B**: `#dfb317` (yellow)
- **C**: `#fe7d37` (orange)
- **D**: `#e05d44` (red)

## 📊 Badge Services

### Shields.io
- **URL**: https://shields.io/
- **Format**: `https://img.shields.io/SERVICE/PARAMETERS`
- **Styles**: `plastic`, `flat`, `flat-square`, `for-the-badge`, `social`

### Popular Services
- **NPM**: `npm/v/PACKAGE`, `npm/dm/PACKAGE`
- **GitHub**: `github/stars/USER/REPO`, `github/forks/USER/REPO`
- **CI/CD**: `github/actions/workflow/status/USER/REPO/WORKFLOW.yml`
- **Coverage**: `codecov/c/github/USER/REPO`
- **Quality**: `codefactor/grade/github/USER/REPO`
- **Bundle**: `bundlephobia/minzip/PACKAGE`

## 🔄 Automatic Badge Updates

### GitHub Actions Integration
Add to `.github/workflows/update-badges.yml`:

```yaml
name: Update Badges

on:
  release:
    types: [published]
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday

jobs:
  update-badges:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Update version badges
      run: |
        VERSION=$(node -p "require('./package.json').version")
        sed -i "s/Version-.*-/Version-$VERSION-/" README.md
    
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add README.md
        git diff --staged --quiet || git commit -m "docs: update version badges to v$VERSION"
        git push
```

### NPM Package Badges
These update automatically when you publish:
- Version: `![NPM Version](https://img.shields.io/npm/v/rm-ng-typeahead)`
- Downloads: `![NPM Downloads](https://img.shields.io/npm/dm/rm-ng-typeahead)`
- Bundle Size: `![Bundle Size](https://img.shields.io/bundlephobia/minzip/rm-ng-typeahead)`

### CI/CD Badges  
These update automatically with your builds:
- Build Status: `![CI](https://img.shields.io/github/actions/workflow/status/user/repo/ci.yml)`
- Test Coverage: `![Coverage](https://img.shields.io/codecov/c/github/user/repo)`

## 📝 Usage Examples

### In README.md
```markdown
<div align="center">

![NPM Version](https://img.shields.io/npm/v/rm-ng-typeahead?style=for-the-badge)
![CI Status](https://img.shields.io/github/actions/workflow/status/user/rm-ng-typeahead/release.yml?style=for-the-badge)

</div>
```

### In Documentation
```markdown
## Requirements

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Angular](https://img.shields.io/badge/Angular-20+-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
```

### In Issue Templates
```markdown
## Environment

![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Browsers](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Firefox%20%7C%20Safari%20%7C%20Edge-green)
```

## 🛠️ Maintenance

### Regular Updates Needed
- [ ] **Angular version** - Update when upgrading Angular
- [ ] **TypeScript version** - Update when upgrading TypeScript
- [ ] **Node.js version** - Update minimum supported version
- [ ] **Browser compatibility** - Update when dropping/adding support
- [ ] **Repository URLs** - Update if repo is moved/renamed

### Automated Updates
- ✅ **NPM version** - Auto-updates on publish
- ✅ **Download counts** - Auto-updates daily
- ✅ **CI status** - Auto-updates on builds
- ✅ **Test coverage** - Auto-updates on coverage reports
- ✅ **Bundle size** - Auto-updates on publish

## 📋 Checklist for New Badges

When adding new badges:
- [ ] Choose appropriate service (shields.io recommended)
- [ ] Use consistent style (`for-the-badge` for headers)
- [ ] Ensure badge provides value to users
- [ ] Test badge URL before committing
- [ ] Add to this documentation
- [ ] Consider if badge needs regular updates

## 🔗 Resources

- [Shields.io Badge Service](https://shields.io/)
- [GitHub Badges](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-repository-badges)
- [NPM Badges](https://shields.io/category/version)
- [Quality Badges](https://shields.io/category/analysis)
- [Badge Style Guide](https://github.com/badges/shields/blob/master/doc/TUTORIAL.md)
