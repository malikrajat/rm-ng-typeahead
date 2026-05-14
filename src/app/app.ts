import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { TypeaheadComponent, TypeaheadOption, TypeaheadConfig } from '../../projects/rm-ng-typeahead/src/public-api';
import { Observable, of, delay } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, TypeaheadComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('rm-ng-typeahead-main');

  // Static options example
  staticOptions: TypeaheadOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' },
    { value: 'fig', label: 'Fig' },
    { value: 'grape', label: 'Grape' },
    { value: 'honeydew', label: 'Honeydew' }
  ];

  // Country options for async example
  countries: TypeaheadOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
    { value: 'br', label: 'Brazil' },
    { value: 'ar', label: 'Argentina' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'it', label: 'Italy' },
    { value: 'es', label: 'Spain' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'India' },
    { value: 'au', label: 'Australia' }
  ];

  // Large dataset for performance testing (100k+ items)
  largeDataset: TypeaheadOption[] = this.generateLargeDataset(100000);

  // Multi-select examples ✨ NEW
  categories: TypeaheadOption[] = [
    { value: 'tech', label: 'Technology' },
    { value: 'science', label: 'Science' },
    { value: 'art', label: 'Art & Design' },
    { value: 'business', label: 'Business' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'education', label: 'Education' },
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food & Cooking' }
  ];

  tags: TypeaheadOption[] = [
    { value: 'angular', label: 'Angular' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'rxjs', label: 'RxJS' },
    { value: 'signals', label: 'Signals' },
    { value: 'performance', label: 'Performance' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'testing', label: 'Testing' },
    { value: 'ci-cd', label: 'CI/CD' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' }
  ];

  // Configuration examples
  basicConfig: TypeaheadConfig = {
    placeholder: 'Search fruits...',
    minLength: 1, // Changed from 2 to 1 for better demo experience
    maxResults: 5,
    debounceTime: 300,
    // Add highlighting colors for search term visibility
    dropdownColors: {
      searchHighlightBackground: '#3b6cffff', // Bright yellow for visibility
      searchHighlightText: '#000000ff', // Black text for contrast
      highlightBackground: '#2196f3', // Blue for option highlighting
      highlightText: '#ffffff' // White text for option highlighting
    }
  };

  // Multi-select configuration ✨ NEW
  multiSelectConfig: TypeaheadConfig = {
    multiSelect: true,
    chipStyle: 'filled',
    chipSize: 'medium',
    maxSelections: 5,
    compactMode: false,
    allowDuplicates: false,
    selectionLimit: 3,
    placeholder: 'Select categories...'
  };

  // Advanced multi-select with custom styling
  advancedMultiConfig: TypeaheadConfig = {
    multiSelect: true,
    chipStyle: 'outline',
    chipSize: 'large',
    maxSelections: 10,
    compactMode: true,
    selectionLimit: 4,
    cancelPreviousRequests: true,
    searchTimeout: 5000,
    retryAttempts: 2,
    placeholder: 'Search and select tags...'
  };

  // Complete color customization configuration ✨ NEW
  colorCustomConfig: TypeaheadConfig = {
    multiSelect: true,
    chipStyle: 'filled',
    chipSize: 'medium',
    maxSelections: 8,
    placeholder: 'Custom color theme...',
    // Complete color configuration
    chipColors: {
      background: '#e8f5e8',
      text: '#2e7d32',
      border: '#4caf50',
      hoverBackground: '#4caf50',
      hoverText: '#ffffff',
      removeHover: 'rgba(255,255,255,0.3)'
    },
    dropdownColors: {
      highlightBackground: '#ff9800',
      highlightText: '#ffffff',
      selectedBackground: '#fff3e0',
      selectedText: '#e65100',
      hoverBackground: '#fce4ec',
      hoverText: '#880e4f',
      searchHighlightBackground: '#e91e63', // Pink highlight for search terms
      searchHighlightText: '#ffffff'
    },
    inputColors: {
      focusBorder: '#9c27b0',
      focusShadow: 'rgba(156, 39, 176, 0.25)'
    }
  };

  // Professional dark theme configuration ✨ NEW
  darkThemeConfig: TypeaheadConfig = {
    multiSelect: true,
    chipStyle: 'filled',
    chipSize: 'medium',
    maxSelections: 6,
    placeholder: 'Dark theme selection...',
    chipColors: {
      background: '#424242',
      text: '#ffffff',
      border: '#616161',
      hoverBackground: '#616161',
      hoverText: '#ffffff',
      removeHover: 'rgba(255,255,255,0.2)'
    },
    dropdownColors: {
      highlightBackground: '#1976d2',
      highlightText: '#ffffff',
      selectedBackground: '#263238',
      selectedText: '#b0bec5',
      hoverBackground: '#37474f',
      hoverText: '#ffffff',
      searchHighlightBackground: '#ffcc02', // Gold highlight for dark theme
      searchHighlightText: '#000000'
    },
    inputColors: {
      focusBorder: '#2196f3',
      focusShadow: 'rgba(33, 150, 243, 0.3)'
    }
  };

  advancedConfig: TypeaheadConfig = {
    placeholder: 'Search countries...',
    minLength: 1,
    maxResults: 8,
    debounceTime: 500,
    highlightFirst: true,
    clearable: true,
    selectOnTab: true,
    selectOnEnter: true,
    closeOnSelect: true
  };

  // Configuration specifically for highlighting demo
  highlightConfig: TypeaheadConfig = {
    placeholder: 'Type to see highlighting...',
    minLength: 1,
    maxResults: 6,
    debounceTime: 200,
    highlightFirst: true,
    clearable: true,
    selectOnTab: true,
    selectOnEnter: true,
    closeOnSelect: false, // Keep dropdown open to show highlighting
    dropdownColors: {
      searchHighlightBackground: '#ff6b35', // Bright orange for demo
      // searchHighlightText: '#ffffff', // White text for contrast
      // highlightBackground: '#2196f3',
      // highlightText: '#ffffff'
    }
  };

  // Enhanced search configuration with new features
  enhancedConfig: TypeaheadConfig = {
    placeholder: 'Enhanced search with cancellation...',
    minLength: 1,
    maxResults: 10,
    debounceTime: 300,
    // Enhanced search features
    cancelPreviousRequests: true,
    searchOnFocus: true,
    searchOnEmpty: false,
    searchTimeout: 5000, // 5 second timeout
    retryAttempts: 2,
    retryDelay: 1000, // 1 second between retries
    // UI enhancements
    highlightFirst: true,
    clearable: true,
    selectOnTab: true,
    selectOnEnter: true,
    closeOnSelect: true
  };

  // Throttle configuration example
  throttleConfig: TypeaheadConfig = {
    placeholder: 'Throttled search (every 200ms)...',
    minLength: 1,
    maxResults: 8,
    throttleTime: 200, // Use throttle instead of debounce
    cancelPreviousRequests: true,
    searchOnFocus: false,
    highlightFirst: true,
    clearable: true
  };

  // High-performance configuration for large datasets
  performanceConfig: TypeaheadConfig = {
    placeholder: 'Search large dataset (100k+ items)...',
    minLength: 2,
    maxResults: 20,
    debounceTime: 200,
    highlightFirst: true,
    clearable: true,
    selectOnTab: true,
    selectOnEnter: true,
    closeOnSelect: true,
    // Performance optimizations
    virtualScrolling: true,
    itemHeight: 40,
    viewportHeight: 300,
    bufferSize: 200,
    recycleNodes: true,
    batchSize: 50,
    lazyLoading: true,
    preloadOffset: 10,
    enableCaching: true,
    cacheSize: 500,
    maxCacheAge: 600000, // 10 minutes
    enableGc: true,
    gcInterval: 120000 // 2 minutes
  };

  // Form controls
  fruitControl = new FormControl('');
  countryControl = new FormControl('');

  // Multi-select form controls ✨ NEW
  categoriesControl = new FormControl<TypeaheadOption[]>([]);
  tagsControl = new FormControl<TypeaheadOption[]>([]);
  customColorControl = new FormControl<TypeaheadOption[]>([]);
  darkThemeControl = new FormControl<TypeaheadOption[]>([]);

  // Form group example
  demoForm = new FormGroup({
    selectedFruit: new FormControl(''),
    selectedCountry: new FormControl('')
  });

  // Multi-select form group ✨ NEW
  multiSelectForm = new FormGroup({
    categories: new FormControl<TypeaheadOption[]>([]),
    tags: new FormControl<TypeaheadOption[]>([]),
    customColorItems: new FormControl<TypeaheadOption[]>([]),
    darkThemeItems: new FormControl<TypeaheadOption[]>([])
  });

  // Signals for demo state
  selectedFruit = signal<any>(null);
  selectedCountry = signal<any>(null);
  selectedHighlight = signal<any>(null); // New signal for highlighting demo
  selectedCategories = signal<any[]>([]);
  selectedTags = signal<any[]>([]);
  selectedLargeItem = signal<string>('');
  selectedEnhanced = signal<string>('');
  selectedThrottle = signal<string>('');

  // Multi-select color demo signals ✨ NEW
  selectedCustomColorItems = signal<TypeaheadOption[]>([]);
  selectedDarkThemeItems = signal<TypeaheadOption[]>([]);

  lastSearchTerm = signal<string>('');

  // Computed properties for display
  selectedCategoryLabels = computed(() =>
    this.selectedCategories().map((c: any) => c.label).join(', ')
  );

  selectedTagLabels = computed(() =>
    this.selectedTags().map((t: any) => t.label)
  );

  // Color demo computed properties ✨ NEW
  selectedCustomColorLabels = computed(() =>
    this.selectedCustomColorItems().map(item => item.label).join(', ')
  );

  selectedDarkThemeLabels = computed(() =>
    this.selectedDarkThemeItems().map(item => item.label).join(', ')
  );

  // Async search function
  searchCountries = (term: string): Observable<TypeaheadOption[]> => {
    const filtered = this.countries.filter(country =>
      country.label.toLowerCase().includes(term.toLowerCase())
    );

    // Simulate network delay
    return of(filtered).pipe(delay(300));
  };

  // High-performance search function for large dataset
  searchLargeDataset = (term: string): Observable<TypeaheadOption[]> => {
    const filtered = this.largeDataset.filter(item =>
      item.label.toLowerCase().includes(term.toLowerCase())
    );

    // Simulate API call with optimized response
    return of(filtered.slice(0, 100)).pipe(delay(150));
  };

  // Generate large dataset for performance testing
  private generateLargeDataset(size: number): TypeaheadOption[] {
    const prefixes = ['Super', 'Ultra', 'Mega', 'Premium', 'Elite', 'Pro', 'Advanced', 'Digital', 'Smart', 'Turbo'];
    const categories = ['Widget', 'Gadget', 'Tool', 'Device', 'System', 'Platform', 'Engine', 'Framework', 'Module', 'Component'];
    const suffixes = ['2024', 'X', 'Plus', 'Max', 'Pro', 'Ultra', 'Advanced', 'Premium', 'Enterprise', 'Cloud'];

    const dataset: TypeaheadOption[] = [];

    for (let i = 0; i < size; i++) {
      const prefix = prefixes[i % prefixes.length];
      const category = categories[Math.floor(i / 100) % categories.length];
      const suffix = suffixes[Math.floor(i / 1000) % suffixes.length];
      const number = String(i + 1).padStart(6, '0');

      dataset.push({
        value: `item-${i}`,
        label: `${prefix} ${category} ${suffix} #${number}`,
        data: { index: i, category, performance: true }
      });
    }

    return dataset;
  }

  // Event handlers
  onFruitSelected(option: TypeaheadOption): void {
    this.selectedFruit.set(option.label);
    console.log('Fruit selected:', option);
  }

  onCountrySelected(option: TypeaheadOption): void {
    this.selectedCountry.set(option.label);
    console.log('Country selected:', option);
  }

  onHighlightSelected(option: TypeaheadOption): void {
    this.selectedHighlight.set(option.label);
    console.log('Highlight demo selected:', option);
  }

  onLargeDatasetSelected(option: TypeaheadOption): void {
    this.selectedLargeItem.set(option.label);
    console.log('Large dataset item selected:', option);
  }

  onSearchChanged(term: string): void {
    this.lastSearchTerm.set(term);
    console.log('Search term changed:', term);
  }

  onOpened(): void {
    console.log('Typeahead opened');
  }

  onClosed(): void {
    console.log('Typeahead closed');
  }

  // Multi-select event handlers ✨ NEW
  onCategoriesChanged(items: TypeaheadOption[]): void {
    this.selectedCategories.set(items);
    console.log('Categories selection changed:', items);
  }

  onCategoryChipRemoved(item: TypeaheadOption): void {
    console.log('Category chip removed:', item);
  }

  onTagsChanged(items: TypeaheadOption[]): void {
    this.selectedTags.set(items);
    console.log('Tags selection changed:', items);
  }

  onTagChipRemoved(item: TypeaheadOption): void {
    console.log('Tag chip removed:', item);
  }

  // Color demo event handlers ✨ NEW
  onCustomColorChanged(items: TypeaheadOption[]): void {
    this.selectedCustomColorItems.set(items);
    console.log('Custom color items changed:', items);
  }

  onCustomColorChipRemoved(item: TypeaheadOption): void {
    console.log('Custom color chip removed:', item);
  }

  onDarkThemeChanged(items: TypeaheadOption[]): void {
    this.selectedDarkThemeItems.set(items);
    console.log('Dark theme items changed:', items);
  }

  onDarkThemeChipRemoved(item: TypeaheadOption): void {
    console.log('Dark theme chip removed:', item);
  }

  // Demo methods
  clearSelections(): void {
    this.fruitControl.setValue('');
    this.countryControl.setValue('');
    this.demoForm.reset();
    this.multiSelectForm.reset();
    this.selectedFruit.set('');
    this.selectedCountry.set('');
    this.selectedCategories.set([]);
    this.selectedTags.set([]);
    this.selectedCustomColorItems.set([]);
    this.selectedDarkThemeItems.set([]);
    this.selectedLargeItem.set('');
    this.selectedEnhanced.set('');
    this.selectedThrottle.set('');
  }

  populateForm(): void {
    this.demoForm.patchValue({
      selectedFruit: 'apple',
      selectedCountry: 'us'
    });

    // Populate multi-select form ✨ NEW
    this.multiSelectForm.patchValue({
      categories: [this.categories[0], this.categories[1]],
      tags: [this.tags[0], this.tags[2]],
      customColorItems: [this.categories[2]],
      darkThemeItems: [this.tags[1], this.tags[3]]
    });
  }

  // Enhanced search methods
  searchCountriesWithDelay = (term: string): Observable<TypeaheadOption[]> => {
    const filtered = this.countries.filter(country =>
      country.label.toLowerCase().includes(term.toLowerCase())
    );

    // Add artificial delay to demonstrate cancellation
    return of(filtered).pipe(delay(2000));
  };

  onEnhancedSelected(option: TypeaheadOption): void {
    this.selectedEnhanced.set(option.label);
    console.log('Enhanced search selected:', option);
  }

  onThrottleSelected(option: TypeaheadOption): void {
    this.selectedThrottle.set(option.label);
    console.log('Throttle search selected:', option);
  }

  performCustomSearch(): void {
    // This would trigger a programmatic search
    console.log('Performing custom search...');
    // Example: this.typeaheadRef.performSearch('custom term');
  }

  cancelAllSearches(): void {
    // This would cancel all ongoing searches
    console.log('Cancelling all searches...');
    // Example: this.typeaheadRef.cancelCurrentSearch();
  }
}
