# RM Angular Typeahead - Installation Guide

This guide will help you install and use the `rm-ng-typeahead` component in your Angular 20+ application.

## Prerequisites

- **Angular 20.2.1 or higher**
- **Node.js 18+ and npm 8+**
- **TypeScript 5.0+**
- **RxJS 7.8+**

## Installation Methods

### Method 1: From Built Library (Recommended for Production)

1. **Build the library first:**
   ```bash
   cd rm-ng-typeahead-main
   ng build rm-ng-typeahead
   ```

2. **Create an npm package:**
   ```bash
   cd dist/rm-ng-typeahead
   npm pack
   ```

3. **Install in your Angular project:**
   ```bash
   npm install path/to/rm-ng-typeahead-x.x.x.tgz
   ```

### Method 2: Direct Integration (Development)

1. **Copy the component files to your project:**
   ```bash
   cp -r projects/rm-ng-typeahead/src/lib/typeahead src/app/components/
   ```

2. **Import and use directly in your components.**

### Method 3: Workspace Library (Monorepo)

1. **Add to angular.json in your existing workspace:**
   ```json
   {
     "projects": {
       "rm-ng-typeahead": {
         "projectType": "library",
         "root": "projects/rm-ng-typeahead",
         // ... rest of library config
       }
     }
   }
   ```

## Quick Setup Guide

### Step 1: Import the Component

```typescript
// In your component file
import { Component } from '@angular/core';
import { TypeaheadComponent, TypeaheadOption } from 'rm-ng-typeahead';

@Component({
  selector: 'app-my-component',
  imports: [TypeaheadComponent], // Add to imports array
  template: `
    <rm-typeahead 
      [options]="myOptions"
      (optionSelected)="onSelect($event)">
    </rm-typeahead>
  `
})
export class MyComponent {
  myOptions: TypeaheadOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ];

  onSelect(option: TypeaheadOption) {
    console.log('Selected:', option);
  }
}
```

### Step 2: Add Styles (Optional)

If you want to customize the default styling:

```scss
// In your global styles.scss or component styles
@import 'rm-ng-typeahead/styles';

// Or override CSS custom properties
:root {
  --rm-typeahead-border-color: #007bff;
  --rm-typeahead-focus-color: #0056b3;
}
```

## Configuration Examples

### Basic Static Options

```typescript
export class BasicExample {
  fruits: TypeaheadOption[] = [
    { value: 'apple', label: 'Apple 🍎' },
    { value: 'banana', label: 'Banana 🍌' },
    { value: 'cherry', label: 'Cherry 🍒' }
  ];

  config = {
    placeholder: 'Search fruits...',
    minLength: 1,
    maxResults: 10,
    clearable: true
  };
}
```

### Async Search with API

```typescript
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class AsyncExample {
  constructor(private http: HttpClient) {}

  searchUsers = (term: string): Observable<TypeaheadOption[]> => {
    return this.http.get<any[]>(`/api/users?search=${term}`)
      .pipe(
        map(users => users.map(user => ({
          value: user.id,
          label: user.name,
          data: user
        })))
      );
  };
}
```

### Form Integration

```typescript
import { FormControl, FormGroup } from '@angular/forms';

export class FormExample {
  userForm = new FormGroup({
    selectedUser: new FormControl('')
  });

  // In template:
  // <rm-typeahead formControlName="selectedUser" [options]="users">
}
```

## Troubleshooting

### Common Issues

1. **Import Error: Cannot find module 'rm-ng-typeahead'**
   - Make sure the library is properly built and installed
   - Check that your tsconfig.json includes the correct paths

2. **Component not rendering**
   - Ensure you've added `TypeaheadComponent` to your component's imports array
   - Verify Angular version compatibility (20+)

3. **Styles not applied**
   - Include the component's CSS file in your build
   - Check for CSS specificity conflicts

4. **TypeScript errors**
   - Ensure you're using TypeScript 5.0+
   - Import the correct interfaces: `TypeaheadOption`, `TypeaheadConfig`

### Performance Tips

1. **Use OnPush change detection** (already implemented in the component)
2. **Debounce search input** (configurable via `debounceTime`)
3. **Limit results** (configurable via `maxResults`)
4. **Use trackBy function** (automatically implemented)

### Accessibility Checklist

- ✅ Keyboard navigation works (arrow keys, enter, escape)
- ✅ Screen readers announce changes
- ✅ Focus management is proper
- ✅ High contrast mode supported
- ✅ Labels are properly associated

## Angular Version Compatibility

| Angular Version | rm-ng-typeahead Version |
|----------------|-------------------------|
| 20.2.1+        | 1.0.0+                 |

## Dependencies

The component has minimal dependencies:

```json
{
  "peerDependencies": {
    "@angular/common": "^20.0.0",
    "@angular/core": "^20.0.0",
    "@angular/forms": "^20.0.0",
    "rxjs": "^7.8.0"
  }
}
```

## Next Steps

1. **Explore the demo**: Run `ng serve` to see interactive examples
2. **Read the full documentation**: Check the README.md for complete API reference
3. **Customize styling**: Override CSS custom properties to match your design
4. **Report issues**: Submit GitHub issues for bugs or feature requests

---

**Need help?** Check the demo application in this repository for working examples!
