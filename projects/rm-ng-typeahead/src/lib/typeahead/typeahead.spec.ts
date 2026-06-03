import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { of } from 'rxjs';

import { TypeaheadComponent, TypeaheadOption } from './typeahead';

describe('TypeaheadComponent - Core Functionality', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;
  let inputElement: HTMLInputElement;
  let debugElement: DebugElement;

  // Mock data for testing
  const mockOptions: TypeaheadOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TypeaheadComponent,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    // Get the input element
    inputElement = debugElement.query(By.css('.rm-typeahead__input')).nativeElement;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default configuration values', () => {
      const config = component.config();
      expect(config.debounceTime).toBe(300);
      expect(config.minLength).toBe(1);
      expect(config.maxResults).toBe(10);
      expect(config.placeholder).toBe('Type to search...');
      expect(config.noResultsText).toBe('No results found');
      expect(config.clearable).toBe(true);
      expect(config.highlightFirst).toBe(true);
    });

    it('should initialize with empty values', () => {
      expect(component.selectedValue()).toBeNull();
      expect(component.isOpen()).toBeFalse();
      expect(component.loading()).toBeFalse();
      expect(component.filteredOptions()).toEqual([]);
    });

    it('should render input element with correct attributes', () => {
      expect(inputElement).toBeTruthy();
      expect(inputElement.getAttribute('role')).toBe('combobox');
      expect(inputElement.getAttribute('aria-autocomplete')).toBe('list');
      expect(inputElement.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Static Options', () => {
    beforeEach(() => {
      component.options = mockOptions;
      fixture.detectChanges();
    });

    it('should accept static options', () => {
      expect(component.options.length).toBe(5);
      expect(component.options[0].label).toBe('Apple');
    });

    it('should respect maxResults configuration', () => {
      component.inputConfig = { maxResults: 2 };
      expect(component.config().maxResults).toBe(2);
    });

    it('should respect minLength configuration', () => {
      component.inputConfig = { minLength: 2 };
      expect(component.config().minLength).toBe(2);
    });
  });

  describe('Async Search', () => {
    it('should accept search function', () => {
      const mockSearchFn = jasmine.createSpy('searchFn').and.returnValue(of(mockOptions));
      component.searchFn = mockSearchFn;

      expect(component.searchFn).toBeDefined();
    });

    it('should handle search results', () => {
      const mockSearchFn = jasmine.createSpy('searchFn').and.returnValue(of(mockOptions));
      component.searchFn = mockSearchFn;

      expect(component.loading()).toBeFalsy();
    });
  });

  describe('Option Selection', () => {
    beforeEach(() => {
      component.options = mockOptions;
      fixture.detectChanges();
    });

    it('should select option programmatically', () => {
      const option = mockOptions[0];
      component.selectOption(option);

      expect(component.selectedValue()).toBe('apple');
      expect(component.searchControl.value).toBe('Apple');
      expect(component.isOpen()).toBeFalse();
    });

    it('should emit optionSelected event', () => {
      spyOn(component.optionSelected, 'emit');

      const option = mockOptions[0];
      component.selectOption(option);

      expect(component.optionSelected.emit).toHaveBeenCalledWith(option);
    });

    it('should not select disabled options', () => {
      const disabledOption: TypeaheadOption = { value: 'disabled', label: 'Disabled', disabled: true };
      component.selectOption(disabledOption);

      expect(component.selectedValue()).toBeNull();
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      component.options = mockOptions;
      component.filteredOptions.set(mockOptions.slice(0, 3)); // Set some filtered options
      fixture.detectChanges();
    });

    it('should navigate down with ArrowDown key', () => {
      component.setHighlightedIndex(0);
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      component.onKeyDown(event);

      expect(component.highlightedIndex()).toBe(1);
    });

    it('should navigate up with ArrowUp key', () => {
      component.setHighlightedIndex(2);

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      component.onKeyDown(event);

      expect(component.highlightedIndex()).toBe(1);
    });

    it('should select option with Enter key', () => {
      spyOn(component, 'selectOption');
      component.setHighlightedIndex(1);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onKeyDown(event);

      expect(component.selectOption).toHaveBeenCalledWith(component.filteredOptions()[1]);
    });

    it('should close dropdown with Escape key', () => {
      component.open();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onKeyDown(event);

      expect(component.isOpen()).toBeFalse();
    });
  });

  describe('Multi-Select Mode', () => {
    beforeEach(() => {
      component.options = mockOptions;
      component.inputConfig = { multiSelect: true };
      fixture.detectChanges();
    });

    it('should support multi-select mode', () => {
      expect(component.config().multiSelect).toBeTruthy();
    });

    it('should allow multiple selections', () => {
      component.selectOption(mockOptions[0]);
      component.selectOption(mockOptions[1]);

      expect(component.selectedItems().length).toBe(2);
      expect(component.selectedItems()[0].value).toBe('apple');
      expect(component.selectedItems()[1].value).toBe('banana');
    });

    it('should clear search input after selection in multi-select', () => {
      component.searchControl.setValue('test');
      component.selectOption(mockOptions[0]);

      expect(component.searchControl.value).toBe('');
    });

    it('should remove chip when clicked', () => {
      const apple = { value: 'apple', label: 'Apple' };
      const banana = { value: 'banana', label: 'Banana' };
      component.selectedItems.set([apple, banana]);

      component.removeChip(apple, new Event('click'));

      expect(component.selectedItems()).toEqual([banana]);
    });

    it('should emit selectionChanged event', () => {
      spyOn(component.selectionChanged, 'emit');

      const apple = { value: 'apple', label: 'Apple' };
      component.selectOption(apple);

      expect(component.selectionChanged.emit).toHaveBeenCalledWith([apple]);
    });
  });

  describe('Form Integration (ControlValueAccessor)', () => {
    beforeEach(() => {
      component.options = mockOptions;
      fixture.detectChanges();
    });

    it('should write value to component', () => {
      component.writeValue('apple');

      expect(component.selectedValue()).toBe('apple');
      expect(component.searchControl.value).toBe('Apple');
    });

    it('should register onChange callback', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      component.registerOnChange(mockOnChange);

      component.selectOption(mockOptions[0]);

      expect(mockOnChange).toHaveBeenCalledWith('apple');
    });

    it('should handle disabled state', () => {
      component.setDisabledState(true);

      expect(component.inputDisabled).toBeTruthy();
      expect(component.searchControl.disabled).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component.options = mockOptions;
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes', () => {
      expect(inputElement.getAttribute('role')).toBe('combobox');
      expect(inputElement.getAttribute('aria-autocomplete')).toBe('list');
      expect(inputElement.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('should update aria-expanded when dropdown opens/closes', () => {
      component.open();
      fixture.detectChanges();

      expect(inputElement.getAttribute('aria-expanded')).toBe('true');

      component.close();
      fixture.detectChanges();

      expect(inputElement.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Configuration Options', () => {
    it('should apply custom placeholder', () => {
      component.inputConfig = { placeholder: 'Custom placeholder' };
      fixture.detectChanges();

      expect(inputElement.getAttribute('placeholder')).toBe('Custom placeholder');
    });

    it('should show custom no results text', () => {
      component.inputConfig = { noResultsText: 'Custom no results' };
      expect(component.config().noResultsText).toBe('Custom no results');
    });

    it('should apply custom debounce time', () => {
      component.inputConfig = { debounceTime: 500 };
      expect(component.config().debounceTime).toBe(500);
    });
  });

  describe('Search Highlighting', () => {
    it('should highlight search terms in results', () => {
      const highlighted = component.getHighlightedText('Apple juice', 'app');
      expect(highlighted).toBeTruthy();
    });

    it('should handle empty search terms', () => {
      const highlighted = component.getHighlightedText('Apple juice', '');
      expect(highlighted).toBeTruthy();
    });

    it('should handle null search terms', () => {
      const highlighted = component.getHighlightedText('Apple juice', null);
      expect(highlighted).toBeTruthy();
    });
  });

  describe('Public API Methods', () => {
    beforeEach(() => {
      component.options = mockOptions;
      fixture.detectChanges();
    });

    it('should clear selection and input', () => {
      component.writeValue('apple');
      component.clear();

      expect(component.selectedValue()).toBeNull();
      expect(component.searchControl.value).toBe('');
      expect(component.isOpen()).toBeFalse();
    });

    it('should focus input element', () => {
      spyOn(inputElement, 'focus');
      component.focus();

      expect(inputElement.focus).toHaveBeenCalled();
    });

    it('should open dropdown programmatically', () => {
      component.open();
      expect(component.isOpen()).toBeTruthy();
    });

    it('should close dropdown programmatically', () => {
      component.open();
      component.close();

      expect(component.isOpen()).toBeFalsy();
      expect(component.highlightedIndex()).toBe(-1);
    });
  });

  describe('Error Handling', () => {
    it('should handle null/undefined values gracefully', () => {
      expect(() => component.writeValue(null)).not.toThrow();
      expect(() => component.writeValue(undefined)).not.toThrow();
    });

    it('should handle invalid option values', () => {
      expect(() => component.selectOption(null as any)).not.toThrow();
      expect(() => component.selectOption(undefined as any)).not.toThrow();
    });

    it('should handle empty options array', () => {
      component.options = [];
      expect(component.filteredOptions()).toEqual([]);
    });
  });
});
