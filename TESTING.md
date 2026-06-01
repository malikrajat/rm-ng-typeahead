# Testing Guide

Comprehensive testing documentation for the rm-ng-typeahead project.

## 🧪 Testing Overview

This project follows Angular testing best practices with a focus on:
- **Unit Testing**: Component, service, and utility testing
- **Integration Testing**: Component interaction testing  
- **Accessibility Testing**: WCAG 2.1 AA compliance
- **Performance Testing**: Memory and rendering optimization
- **E2E Testing**: User workflow validation (optional)

## 📋 Testing Strategy

### Test Pyramid
```
    /\     E2E Tests (Few)
   /  \    ├── User workflows
  /____\   └── Critical paths
 /      \  
/________\  Integration Tests (Some)
│        │  ├── Component interactions
│        │  └── Service integrations
│________│  
│        │  Unit Tests (Many)
│        │  ├── Component logic
│        │  ├── Service methods
│        │  └── Utility functions
```

### Coverage Goals
- **Unit Tests**: >95% code coverage
- **Integration Tests**: All component interactions
- **E2E Tests**: Critical user journeys
- **Accessibility**: WCAG 2.1 AA compliance

## 🏗️ Test Setup

### Testing Dependencies
```json
{
  "devDependencies": {
    "@angular/testing": "^20.2.3",
    "jasmine": "~5.1.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "@testing-library/angular": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "axe-core": "^4.8.0"
  }
}
```

### Karma Configuration
```javascript
// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: true,
        seed: '4321'
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/rm-ng-typeahead'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' }
      ],
      check: {
        global: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```

## 📝 Unit Testing

### Component Testing Template
```typescript
// typeahead.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadComponent } from './typeahead.component';
import { TypeaheadOption, TypeaheadConfig } from '../interfaces';

describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;
  let compiled: HTMLElement;

  const mockOptions: TypeaheadOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TypeaheadComponent,
        FormsModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default configuration', () => {
      expect(component.config()).toEqual(jasmine.objectContaining({
        placeholder: 'Type to search...',
        debounceTime: 300,
        minSearchLength: 1,
        maxResults: 10
      }));
    });

    it('should initialize with empty options', () => {
      expect(component.options()).toEqual([]);
    });
  });

  describe('Input Properties', () => {
    it('should accept options input', () => {
      component.options.set(mockOptions);
      fixture.detectChanges();
      expect(component.options()).toEqual(mockOptions);
    });

    it('should accept custom configuration', () => {
      const customConfig: Partial<TypeaheadConfig> = {
        placeholder: 'Custom placeholder',
        debounceTime: 500
      };
      component.inputConfig = customConfig;
      fixture.detectChanges();
      
      expect(component.config().placeholder).toBe('Custom placeholder');
      expect(component.config().debounceTime).toBe(500);
    });

    it('should handle disabled state', () => {
      component.inputDisabled = true;
      fixture.detectChanges();
      
      const input = compiled.querySelector('input');
      expect(input?.disabled).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      component.options.set(mockOptions);
      fixture.detectChanges();
    });

    it('should filter options based on search term', () => {
      component.searchTerm.set('app');
      expect(component.filteredOptions()).toEqual([
        { value: 'apple', label: 'Apple' }
      ]);
    });

    it('should be case insensitive', () => {
      component.searchTerm.set('APP');
      expect(component.filteredOptions()).toEqual([
        { value: 'apple', label: 'Apple' }
      ]);
    });

    it('should respect maxResults configuration', () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        value: `item${i}`,
        label: `Item ${i}`
      }));
      component.options.set(manyOptions);
      component.searchTerm.set('item');
      
      expect(component.filteredOptions().length).toBeLessThanOrEqual(10);
    });

    it('should emit searchChanged event', () => {
      spyOn(component.searchChanged, 'emit');
      component.onSearchChange('test');
      expect(component.searchChanged.emit).toHaveBeenCalledWith('test');
    });
  });

  describe('Option Selection', () => {
    beforeEach(() => {
      component.options.set(mockOptions);
      fixture.detectChanges();
    });

    it('should select option and emit event', () => {
      spyOn(component.optionSelected, 'emit');
      const option = mockOptions[0];
      
      component.selectOption(option);
      
      expect(component.selectedOption()).toEqual(option);
      expect(component.optionSelected.emit).toHaveBeenCalledWith(option);
      expect(component.isOpen()).toBeFalsy();
    });

    it('should update form control value', () => {
      const option = mockOptions[0];
      component.selectOption(option);
      
      expect(component.value).toBe(option.value);
    });

    it('should clear selection', () => {
      component.selectOption(mockOptions[0]);
      component.clear();
      
      expect(component.selectedOption()).toBeNull();
      expect(component.searchTerm()).toBe('');
      expect(component.value).toBe('');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      component.options.set(mockOptions);
      component.searchTerm.set('');
      component.isOpen.set(true);
      fixture.detectChanges();
    });

    it('should navigate down with ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      component.onKeyDown(event);
      
      expect(component.highlightedIndex()).toBe(0);
    });

    it('should navigate up with ArrowUp', () => {
      component.highlightedIndex.set(1);
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      component.onKeyDown(event);
      
      expect(component.highlightedIndex()).toBe(0);
    });

    it('should select highlighted option with Enter', () => {
      spyOn(component, 'selectOption');
      component.highlightedIndex.set(0);
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onKeyDown(event);
      
      expect(component.selectOption).toHaveBeenCalledWith(mockOptions[0]);
    });

    it('should close dropdown with Escape', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onKeyDown(event);
      
      expect(component.isOpen()).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      component.options.set(mockOptions);
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const input = compiled.querySelector('input');
      const dropdown = compiled.querySelector('[role="listbox"]');
      
      expect(input?.getAttribute('role')).toBe('combobox');
      expect(input?.getAttribute('aria-expanded')).toBe('true');
      expect(input?.getAttribute('aria-haspopup')).toBe('listbox');
      expect(dropdown).toBeTruthy();
    });

    it('should have unique IDs for accessibility', () => {
      fixture.detectChanges();
      
      const input = compiled.querySelector('input');
      const dropdown = compiled.querySelector('[role="listbox"]');
      
      expect(input?.id).toMatch(/typeahead-input-/);
      expect(dropdown?.id).toMatch(/typeahead-dropdown-/);
    });

    it('should announce selection to screen readers', () => {
      const option = mockOptions[0];
      component.selectOption(option);
      fixture.detectChanges();
      
      const announcement = compiled.querySelector('[aria-live="polite"]');
      expect(announcement?.textContent).toContain(option.label);
    });
  });

  describe('Form Integration', () => {
    it('should implement ControlValueAccessor', () => {
      expect(component.writeValue).toBeDefined();
      expect(component.registerOnChange).toBeDefined();
      expect(component.registerOnTouched).toBeDefined();
      expect(component.setDisabledState).toBeDefined();
    });

    it('should write value from form control', () => {
      component.writeValue('apple');
      expect(component.value).toBe('apple');
    });

    it('should call onChange when value changes', () => {
      const onChange = jasmine.createSpy('onChange');
      component.registerOnChange(onChange);
      
      component.selectOption(mockOptions[0]);
      expect(onChange).toHaveBeenCalledWith('apple');
    });

    it('should call onTouched when input is blurred', () => {
      const onTouched = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouched);
      
      component.onBlur();
      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should use OnPush change detection', () => {
      expect(component.changeDetection).toBe(ChangeDetectionStrategy.OnPush);
    });

    it('should track options efficiently', () => {
      const trackFn = component.trackByOption;
      const option = mockOptions[0];
      
      expect(trackFn(0, option)).toBe(option.value);
    });

    it('should debounce search input', fakeAsync(() => {
      spyOn(component, 'onSearchChange');
      const input = compiled.querySelector('input') as HTMLInputElement;
      
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      
      tick(200); // Less than debounce time
      expect(component.onSearchChange).not.toHaveBeenCalled();
      
      tick(150); // Complete debounce time
      expect(component.onSearchChange).toHaveBeenCalledWith('test');
    }));
  });
});
```

### Service Testing (if applicable)
```typescript
// typeahead.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { TypeaheadService } from './typeahead.service';

describe('TypeaheadService', () => {
  let service: TypeaheadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeaheadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Add service-specific tests
});
```

## 🔗 Integration Testing

### Component Interaction Testing
```typescript
// typeahead.integration.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Component } from '@angular/core';
import { TypeaheadComponent } from './typeahead.component';

@Component({
  template: `
    <form [formGroup]="form">
      <rm-typeahead 
        formControlName="selection"
        [options]="options"
        (optionSelected)="onSelect($event)">
      </rm-typeahead>
    </form>
  `
})
class TestHostComponent {
  form = new FormGroup({
    selection: new FormControl('')
  });
  
  options = [
    { value: 'test', label: 'Test Option' }
  ];
  
  selectedOption: any = null;
  
  onSelect(option: any) {
    this.selectedOption = option;
  }
}

describe('Typeahead Integration', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [ReactiveFormsModule, TypeaheadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should integrate with reactive forms', () => {
    const typeahead = fixture.debugElement.query(
      By.directive(TypeaheadComponent)
    ).componentInstance;
    
    typeahead.selectOption(component.options[0]);
    
    expect(component.form.get('selection')?.value).toBe('test');
    expect(component.selectedOption).toEqual(component.options[0]);
  });
});
```

## ♿ Accessibility Testing

### Manual Accessibility Testing
```typescript
// accessibility.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { TypeaheadComponent } from './typeahead.component';

describe('Typeahead Accessibility', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
  });

  it('should pass axe accessibility tests', async () => {
    // This would require puppeteer setup for full testing
    // For unit tests, we check ARIA attributes manually
    
    component.options.set([
      { value: 'test', label: 'Test' }
    ]);
    component.isOpen.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('input');
    const listbox = compiled.querySelector('[role="listbox"]');

    // Check required ARIA attributes
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-haspopup')).toBe('listbox');
    expect(listbox).toBeTruthy();
    expect(listbox.getAttribute('role')).toBe('listbox');
  });

  it('should support keyboard navigation', () => {
    component.options.set([
      { value: 'test1', label: 'Test 1' },
      { value: 'test2', label: 'Test 2' }
    ]);
    component.isOpen.set(true);
    fixture.detectChanges();

    // Test arrow key navigation
    const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.onKeyDown(arrowDownEvent);
    expect(component.highlightedIndex()).toBe(0);

    // Test enter key selection
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(component, 'selectOption');
    component.onKeyDown(enterEvent);
    expect(component.selectOption).toHaveBeenCalled();
  });

  it('should announce changes to screen readers', () => {
    fixture.detectChanges();
    const announcement = fixture.nativeElement.querySelector('[aria-live="polite"]');
    expect(announcement).toBeTruthy();
  });
});
```

### WCAG 2.1 AA Compliance Checklist
- [ ] **Perceivable**
  - [ ] Color contrast ratio ≥ 4.5:1
  - [ ] Text is resizable up to 200%
  - [ ] Focus indicators are visible
- [ ] **Operable**  
  - [ ] All functionality available via keyboard
  - [ ] No keyboard traps
  - [ ] Sufficient time for interactions
- [ ] **Understandable**
  - [ ] Clear labels and instructions
  - [ ] Consistent navigation
  - [ ] Error identification and suggestions
- [ ] **Robust**
  - [ ] Valid HTML markup
  - [ ] Compatible with assistive technologies
  - [ ] Progressive enhancement

## ⚡ Performance Testing

### Performance Metrics Testing
```typescript
// performance.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeaheadComponent } from './typeahead.component';

describe('Typeahead Performance', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
  });

  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      value: `item${i}`,
      label: `Item ${i}`
    }));

    const start = performance.now();
    component.options.set(largeDataset);
    component.searchTerm.set('item1');
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Should complete in <100ms
    expect(component.filteredOptions().length).toBeLessThanOrEqual(10);
  });

  it('should prevent memory leaks', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize;
    
    // Simulate heavy usage
    for (let i = 0; i < 1000; i++) {
      component.searchTerm.set(`search${i}`);
      component.filteredOptions();
    }
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize;
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB increase
    }
  });

  it('should debounce search efficiently', fakeAsync(() => {
    let searchCallCount = 0;
    component.searchChanged.subscribe(() => searchCallCount++);

    // Simulate rapid typing
    for (let i = 0; i < 10; i++) {
      component.onSearchChange(`search${i}`);
      tick(50); // Fast typing
    }

    tick(300); // Complete debounce
    expect(searchCallCount).toBe(1); // Only final search executed
  }));
});
```

## 🌐 E2E Testing (Optional)

### Cypress E2E Tests
```typescript
// cypress/e2e/typeahead.cy.ts
describe('Typeahead E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should search and select option', () => {
    cy.get('[data-cy="typeahead-input"]').type('app');
    cy.get('[data-cy="typeahead-option"]').contains('Apple').click();
    cy.get('[data-cy="typeahead-input"]').should('have.value', 'Apple');
  });

  it('should navigate with keyboard', () => {
    cy.get('[data-cy="typeahead-input"]').type('a');
    cy.get('[data-cy="typeahead-input"]').type('{downarrow}');
    cy.get('[data-cy="typeahead-option"].highlighted').should('exist');
    cy.get('[data-cy="typeahead-input"]').type('{enter}');
    cy.get('[data-cy="typeahead-input"]').should('not.be.empty');
  });

  it('should work on mobile devices', () => {
    cy.viewport('iphone-x');
    cy.get('[data-cy="typeahead-input"]').type('test');
    cy.get('[data-cy="typeahead-dropdown"]').should('be.visible');
  });
});
```

## 🚀 Test Commands

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in headless mode (CI)
npm run test:ci

# Run specific test file
ng test --include="**/typeahead.component.spec.ts"

# Run tests with specific pattern
ng test --grep="should filter options"
```

### Advanced Commands
```bash
# Run tests with performance monitoring
npm run test:performance

# Run accessibility tests
npm run test:a11y

# Run visual regression tests
npm run test:visual

# Generate test coverage report
npm run coverage:report

# Upload coverage to codecov
npm run coverage:upload
```

### Debugging Tests
```bash
# Debug specific test
ng test --include="**/component.spec.ts" --source-map

# Run with verbose output
ng test --verbose

# Run single test run (no watch)
ng test --watch=false --browsers=ChromeHeadless
```

## 📊 Coverage Reports

### Coverage Configuration
```json
{
  "coverageReporter": {
    "reporters": [
      { "type": "html", "subdir": "html" },
      { "type": "lcov", "subdir": "lcov" },
      { "type": "text-summary" }
    ],
    "check": {
      "global": {
        "statements": 95,
        "branches": 90,
        "functions": 95,
        "lines": 95
      }
    }
  }
}
```

### Reading Coverage Reports
- **Statements**: Percentage of statements executed
- **Branches**: Percentage of control structure branches executed  
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Improving Coverage
1. **Identify uncovered code**: Use HTML report to find missing coverage
2. **Add missing tests**: Write tests for uncovered branches
3. **Test error scenarios**: Include negative test cases
4. **Mock dependencies**: Isolate units under test
5. **Test edge cases**: Cover boundary conditions

## 🔧 Test Utilities

### Custom Test Utilities
```typescript
// test-utils.ts
import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

export class TypeaheadTestUtils {
  static getInput(fixture: ComponentFixture<any>): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[role="combobox"]');
  }

  static getDropdown(fixture: ComponentFixture<any>): HTMLElement {
    return fixture.nativeElement.querySelector('[role="listbox"]');
  }

  static getOptions(fixture: ComponentFixture<any>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="option"]'));
  }

  static simulateKeyPress(
    element: HTMLElement, 
    key: string, 
    fixture: ComponentFixture<any>
  ): void {
    const event = new KeyboardEvent('keydown', { key });
    element.dispatchEvent(event);
    fixture.detectChanges();
  }

  static async waitForDebounce(fixture: ComponentFixture<any>, ms = 300): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        fixture.detectChanges();
        resolve();
      }, ms);
    });
  }
}

// Usage in tests
describe('TypeaheadComponent', () => {
  it('should handle user input', async () => {
    const input = TypeaheadTestUtils.getInput(fixture);
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    
    await TypeaheadTestUtils.waitForDebounce(fixture);
    
    const dropdown = TypeaheadTestUtils.getDropdown(fixture);
    expect(dropdown).toBeTruthy();
  });
});
```

## 🎯 Testing Best Practices

### Unit Test Best Practices
1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Follow AAA pattern (Arrange, Act, Assert)**
4. **Keep tests independent**
5. **Use proper mocking**
6. **Test edge cases and error scenarios**

### Component Testing Guidelines
1. **Test component inputs and outputs**
2. **Verify DOM rendering**
3. **Test user interactions**
4. **Check accessibility features**
5. **Validate form integration**
6. **Test lifecycle methods**

### Performance Testing Tips
1. **Monitor memory usage**
2. **Test with large datasets**
3. **Measure rendering time**
4. **Check for memory leaks**
5. **Validate debouncing**
6. **Test change detection optimization**

## 🚨 Troubleshooting Tests

### Common Issues

#### Test Failures
```bash
# Clear test cache
rm -rf .angular/cache
npm test

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm test
```

#### Coverage Issues
```bash
# Generate detailed coverage
ng test --code-coverage --watch=false

# Check coverage thresholds
cat coverage/lcov-report/index.html
```

#### Async Test Problems
```typescript
// Use fakeAsync for timer-based tests
it('should debounce input', fakeAsync(() => {
  component.onSearchChange('test');
  tick(300);
  expect(component.searchTerm()).toBe('test');
}));

// Use async/await for promise-based tests
it('should handle async operations', async () => {
  const result = await component.searchAsync('test');
  expect(result).toBeDefined();
});
```

This comprehensive testing guide ensures high-quality, maintainable code with excellent test coverage and accessibility compliance.
