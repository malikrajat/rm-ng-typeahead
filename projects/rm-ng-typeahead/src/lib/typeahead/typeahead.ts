import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  TemplateRef,
  ContentChild,
  Injector,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
  effect,
  AfterViewInit,
  TrackByFunction
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  filter,
  map,
  takeUntil,
  startWith,
  tap,
  throttleTime,
  retry,
  timeout,
  finalize
} from 'rxjs/operators';
import { Observable, Subject, of, BehaviorSubject, merge } from 'rxjs';

export interface TypeaheadOption {
  value: any;
  label: string;
  disabled?: boolean;
  data?: any;
}

export interface TypeaheadConfig {
  debounceTime?: number;
  minLength?: number;
  maxResults?: number;
  placeholder?: string;
  noResultsText?: string;
  loadingText?: string;
  clearable?: boolean;
  disabled?: boolean;
  highlightFirst?: boolean;
  selectOnTab?: boolean;
  selectOnEnter?: boolean;
  closeOnSelect?: boolean;
  typeToSelect?: boolean;
  // Multi-select features
  multiSelect?: boolean;
  maxSelections?: number; // Maximum number of selections (0 = unlimited)
  allowDuplicates?: boolean; // Allow selecting the same item multiple times
  chipStyle?: 'default' | 'outline' | 'filled' | 'minimal'; // Visual style for chips
  chipSize?: 'small' | 'medium' | 'large'; // Size of chips
  chipRemovable?: boolean; // Whether chips can be removed individually
  chipIcon?: string; // Custom icon for chips
  showChipLabels?: boolean; // Show labels on chips
  compactMode?: boolean; // Compact display for many selections
  selectionLimit?: number; // Show "+X more" after this many chips
  customChipTemplate?: boolean; // Allow custom chip templates

  // Color Configuration for improved UX
  chipColors?: {
    background?: string; // Default chip background color
    text?: string; // Default chip text color
    border?: string; // Default chip border color
    hoverBackground?: string; // Hover state background
    hoverText?: string; // Hover state text color
    removeHover?: string; // Remove button hover color
  };
  dropdownColors?: {
    highlightBackground?: string; // Highlighted option background
    highlightText?: string; // Highlighted option text
    selectedBackground?: string; // Selected option background
    selectedText?: string; // Selected option text
    hoverBackground?: string; // Option hover background
    hoverText?: string; // Option hover text
    searchHighlightBackground?: string; // Search term highlight background
    searchHighlightText?: string; // Search term highlight text color
  };
  inputColors?: {
    focusBorder?: string; // Input focus border color
    focusShadow?: string; // Input focus shadow color
  };
  // Enhanced search features
  cancelPreviousRequests?: boolean;
  searchOnFocus?: boolean;
  searchOnEmpty?: boolean;
  throttleTime?: number; // Alternative to debounce for more responsive search
  searchTimeout?: number; // Maximum time to wait for search response
  retryAttempts?: number; // Number of retry attempts for failed requests
  retryDelay?: number; // Delay between retry attempts
  // Performance optimizations
  virtualScrolling?: boolean;
  itemHeight?: number;
  viewportHeight?: number;
  bufferSize?: number;
  recycleNodes?: boolean;
  batchSize?: number;
  lazyLoading?: boolean;
  preloadOffset?: number;
  enableCaching?: boolean;
  cacheSize?: number;
  // Memory management
  maxCacheAge?: number;
  enableGc?: boolean;
  gcInterval?: number;
  // Accessibility enhancements
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  ariaRequired?: boolean;
  announceResults?: boolean;
  announceSelection?: boolean;
  announceLoading?: boolean;
  announceNoResults?: boolean;
  screenReaderDebounce?: number;
  keyboardShortcuts?: boolean;
  focusManagement?: boolean;
  highContrastMode?: boolean;
  reducedMotion?: boolean;
  // Live region announcements
  liveRegion?: 'off' | 'polite' | 'assertive';
  resultCountAnnouncement?: boolean;
  navigationAnnouncement?: boolean;
}

@Component({
  selector: 'rm-typeahead',
  imports: [CommonModule, ReactiveFormsModule, ScrollingModule],
  template: `
    <div class="rm-typeahead"
         [class.rm-typeahead--disabled]="disabled()"
         [class.rm-typeahead--open]="isOpen()"
         [class.rm-typeahead--high-contrast]="config().highContrastMode"
         [class.rm-typeahead--reduced-motion]="config().reducedMotion"
         [ngStyle]="hostStyles()"
         role="group"
         [attr.aria-label]="config().ariaLabel || 'Typeahead search'">

      <!-- Screen reader only instructions -->
      <div id="{{instanceId}}-instructions" class="rm-typeahead__sr-only">
        Use arrow keys to navigate results, Enter to select, Escape to close
      </div>

      <!-- Live region for screen reader announcements -->
      <div
        id="{{instanceId}}-live-region"
        class="rm-typeahead__sr-only"
        aria-live="{{config().liveRegion || 'polite'}}"
        aria-atomic="true">
        {{ currentAnnouncement() }}
      </div>

      <div class="rm-typeahead__input-container">

        <!-- Multi-select chips/tags display -->
        @if (config().multiSelect && selectedItems().length > 0) {
          <div class="rm-typeahead__chips-container"
               [class.rm-typeahead__chips--compact]="config().compactMode"
               [attr.aria-label]="'Selected items: ' + selectedItems().length">

            @for (item of visibleSelectedItems(); track item.value; let i = $index) {
              <div class="rm-typeahead__chip"
                   [class]="getChipClasses()"
                   [attr.aria-label]="'Selected: ' + item.label + (config().chipRemovable ? '. Press Delete to remove' : '')"
                   role="option"
                   [attr.aria-selected]="true">

                @if (config().showChipLabels) {
                  <span class="rm-typeahead__chip-label">{{ item.label }}</span>
                }

                @if (config().chipRemovable) {
                  <button type="button"
                          class="rm-typeahead__chip-remove"
                          (click)="removeChip(item, $event)"
                          [attr.aria-label]="'Remove ' + item.label"
                          tabindex="-1">
                    <span aria-hidden="true">&times;</span>
                  </button>
                }
              </div>
            }

            @if (hasMoreChips()) {
              <div class="rm-typeahead__chip rm-typeahead__chip--more"
                   [attr.aria-label]="getRemainingChipsLabel()">
                +{{ remainingChipsCount() }} more
              </div>
            }
          </div>
        }
        <input
          #inputElement
          class="rm-typeahead__input"
          [formControl]="searchControl"
          [placeholder]="config().placeholder"
          [disabled]="disabled()"
          (focus)="onFocus()"
          (blur)="onBlur($event)"
          (keydown)="onKeyDown($event)"
          (input)="onInput($event)"
          autocomplete="off"
          role="combobox"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-autocomplete]="'list'"
          [attr.aria-owns]="dropdownId"
          [attr.aria-activedescendant]="activeOptionId()"
          [attr.aria-describedby]="getAriaDescribedBy()"
          [attr.aria-label]="config().ariaLabel"
          [attr.aria-invalid]="config().ariaInvalid"
          [attr.aria-required]="config().ariaRequired"
          [attr.aria-haspopup]="'listbox'"
        />

        @if (config().clearable && searchControl.value && !disabled()) {
          <button
            type="button"
            class="rm-typeahead__clear"
            (click)="clear()"
            [attr.aria-label]="getClearButtonAriaLabel()"
            tabindex="-1"
          >
            <span aria-hidden="true">✕</span>
          </button>
        }

        @if (loading()) {
          <div
            class="rm-typeahead__spinner"
            [attr.aria-label]="config().loadingText || 'Loading results'"
            role="status"
            aria-live="polite">
            <div class="rm-typeahead__spinner-icon" aria-hidden="true"></div>
            <span class="rm-typeahead__sr-only">{{ config().loadingText || 'Loading results' }}</span>
          </div>
        }
      </div>

      @if (isOpen() && (visibleOptions().length > 0 || loading() || showNoResults())) {
        <div
          class="rm-typeahead__dropdown"
          [id]="dropdownId"
          role="listbox"
          [attr.aria-label]="getDropdownAriaLabel()"
          [attr.aria-multiselectable]="false"
          [attr.aria-orientation]="'vertical'"
        >
          @if (loading()) {
            <div
              class="rm-typeahead__option rm-typeahead__option--loading"
              role="status"
              aria-live="polite">
              {{ config().loadingText }}
            </div>
          } @else if (visibleOptions().length === 0 && showNoResults()) {
            <div
              class="rm-typeahead__option rm-typeahead__option--no-results"
              role="status"
              aria-live="polite">
              {{ config().noResultsText }}
            </div>
          } @else {
            @if (config().virtualScrolling && visibleOptions().length > virtualScrollThreshold()) {
              <cdk-virtual-scroll-viewport
                #virtualScrollViewport
                class="rm-typeahead__virtual-viewport"
                [itemSize]="config().itemHeight || 40"
                [maxBufferPx]="config().bufferSize || 200"
                [minBufferPx]="config().bufferSize || 200"
                [style.height.px]="config().viewportHeight || 200"
                role="none">
                @for (option of visibleOptions(); track trackByOptimized($index, option); let i = $index) {
                  <div
                    class="rm-typeahead__option"
                    [class.rm-typeahead__option--highlighted]="virtualHighlightedIndex() === i"
                    [class.rm-typeahead__option--selected]="isSelected(option)"
                    [class.rm-typeahead__option--disabled]="option.disabled"
                    [id]="getOptionId(i)"
                    (click)="selectOption(option)"
                    (mousedown)="$event.preventDefault()"
                    (mouseenter)="setHighlightedIndex(i)"
                    role="option"
                    [attr.aria-selected]="isSelected(option)"
                    [attr.aria-disabled]="option.disabled"
                    [attr.aria-setsize]="visibleOptions().length"
                    [attr.aria-posinset]="i + 1"
                    [attr.aria-label]="getOptionAriaLabel(option, i)"
                    tabindex="-1"
                  >
                    @if (optionTemplate) {
                      <ng-container
                        *ngTemplateOutlet="optionTemplate; context: { $implicit: option, index: i }"
                      ></ng-container>
                    } @else {
                      <span [innerHTML]="getHighlightedText(option.label, searchControl.value || '')"></span>
                    }
                  </div>
                }
              </cdk-virtual-scroll-viewport>
            } @else {
              @for (option of visibleOptions(); track trackByOptimized($index, option); let i = $index) {
                <div
                  class="rm-typeahead__option"
                  [class.rm-typeahead__option--highlighted]="highlightedIndex() === i"
                  [class.rm-typeahead__option--selected]="isSelected(option)"
                  [class.rm-typeahead__option--disabled]="option.disabled"
                  [id]="getOptionId(i)"
                  (click)="selectOption(option)"
                  (mousedown)="$event.preventDefault()"
                  (mouseenter)="setHighlightedIndex(i)"
                  role="option"
                  [attr.aria-selected]="isSelected(option)"
                  [attr.aria-disabled]="option.disabled"
                  [attr.aria-setsize]="visibleOptions().length"
                  [attr.aria-posinset]="i + 1"
                  [attr.aria-label]="getOptionAriaLabel(option, i)"
                  tabindex="-1"
                >
                  @if (optionTemplate) {
                    <ng-container
                      *ngTemplateOutlet="optionTemplate; context: { $implicit: option, index: i }"
                    ></ng-container>
                  } @else {
                    <span [innerHTML]="getHighlightedText(option.label, searchControl.value || '')"></span>
                  }
                </div>
              }
            }
          }
        </div>
      }
    </div>
  `,
  styleUrl: './typeahead.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeaheadComponent),
      multi: true
    }
  ]
})
export class TypeaheadComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() options: TypeaheadOption[] = [];
  @Input() searchFn?: (term: string) => Observable<TypeaheadOption[]>;
  @Input() inputConfig: Partial<TypeaheadConfig> = {};
  @Input() inputDisabled = false;
  @Input() defaultValue?: any; // New input for setting default value
  @Input() defaultLabel?: string; // New input for displaying default label while preserving value

  @Output() optionSelected = new EventEmitter<TypeaheadOption>();
  @Output() selectionChanged = new EventEmitter<TypeaheadOption[]>(); // For multi-select mode
  @Output() chipRemoved = new EventEmitter<TypeaheadOption>(); // When a chip is removed
  @Output() searchChanged = new EventEmitter<string>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('inputElement', { static: true }) inputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('virtualScrollViewport') virtualScrollViewport?: CdkVirtualScrollViewport;
  @ContentChild('optionTemplate') optionTemplate?: TemplateRef<any>;

  // Core signals for reactive state management
  readonly loading = signal(false);
  readonly isOpen = signal(false);
  readonly highlightedIndex = signal(-1);
  readonly filteredOptions = signal<TypeaheadOption[]>([]);
  readonly selectedValue = signal<any>(null);
  readonly selectedItems = signal<TypeaheadOption[]>([]); // For multi-select mode
  readonly showNoResults = signal(false);

  // Performance optimization signals
  readonly visibleOptions = signal<TypeaheadOption[]>([]);
  readonly virtualScrollThreshold = signal(50);
  readonly virtualHighlightedIndex = signal(-1);
  readonly cacheMap = signal(new Map<string, { data: TypeaheadOption[], timestamp: number }>());
  readonly lastSearchTerm = signal('');
  readonly batchUpdatePending = signal(false);

  // Accessibility signals
  readonly currentAnnouncement = signal('');
  readonly lastAnnouncementTime = signal(0);
  readonly keyboardInstructions = signal('Use arrow keys to navigate, Enter to select, Escape to close');
  readonly screenReaderContext = signal('');
  readonly justSelected = signal(false); // Track when we've just made a selection

  // Computed signals for performance
  readonly config = computed(() => ({
    debounceTime: 300,
    minLength: 1,
    maxResults: 10,
    placeholder: 'Type to search...',
    noResultsText: 'No results found',
    loadingText: 'Loading...',
    clearable: true,
    disabled: false,
    highlightFirst: true,
    selectOnTab: true,
    selectOnEnter: true,
    closeOnSelect: true,
    typeToSelect: false,
    // Multi-select defaults
    multiSelect: false,
    maxSelections: 0, // 0 = unlimited
    allowDuplicates: false,
    chipStyle: 'default' as const,
    chipSize: 'medium' as const,
    chipRemovable: true,
    showChipLabels: true,
    compactMode: false,
    selectionLimit: 5, // Show "+X more" after 5 chips
    customChipTemplate: false,

    // Color Configuration with improved defaults
    chipColors: {
      background: '#e3f2fd', // Light blue background instead of white
      text: '#1565c0', // Dark blue text for better readability
      border: '#bbdefb', // Light blue border
      hoverBackground: '#2196f3', // Blue hover background
      hoverText: '#ffffff', // White text on hover
      removeHover: 'rgba(255, 255, 255, 0.3)' // Semi-transparent white for remove button
    },
    dropdownColors: {
      highlightBackground: '#2196f3', // Better blue instead of yellow
      highlightText: '#ffffff', // White text for contrast
      selectedBackground: '#e8f5e8', // Light green for selected items
      selectedText: '#2e7d32', // Dark green text
      hoverBackground: '#f5f5f5', // Light gray hover
      hoverText: '#333333', // Dark text on hover
      searchHighlightBackground: '#ffcc02', // Better yellow/gold for search highlighting
      searchHighlightText: '#000000' // Black text for better readability
    },
    inputColors: {
      focusBorder: '#2196f3', // Blue focus border
      focusShadow: 'rgba(33, 150, 243, 0.25)' // Blue focus shadow
    },
    // Enhanced search features
    cancelPreviousRequests: true,
    searchOnFocus: false,
    searchOnEmpty: false,
    throttleTime: 0, // 0 means use debounce instead
    searchTimeout: 10000, // 10 seconds timeout
    retryAttempts: 2,
    retryDelay: 1000, // 1 second between retries
    // Performance defaults
    virtualScrolling: true,
    itemHeight: 40,
    viewportHeight: 200,
    bufferSize: 200,
    recycleNodes: true,
    batchSize: 100,
    lazyLoading: true,
    preloadOffset: 5,
    enableCaching: true,
    cacheSize: 1000,
    maxCacheAge: 300000, // 5 minutes
    enableGc: true,
    gcInterval: 60000, // 1 minute
    // Accessibility defaults
    announceResults: true,
    announceSelection: true,
    announceLoading: true,
    announceNoResults: true,
    screenReaderDebounce: 500,
    keyboardShortcuts: true,
    focusManagement: true,
    highContrastMode: false,
    reducedMotion: false,
    liveRegion: 'polite' as const,
    resultCountAnnouncement: true,
    navigationAnnouncement: true,
    ...this.inputConfig
  }));

  readonly activeOptionId = computed(() => {
    const index = this.config().virtualScrolling ?
      this.virtualHighlightedIndex() : this.highlightedIndex();
    return index >= 0 ? this.getOptionId(index) : null;
  });

  readonly disabled = computed(() => this.inputDisabled || this.config().disabled);

  // Multi-select computed properties
  readonly visibleSelectedItems = computed(() => {
    const items = this.selectedItems();
    const limit = this.config().selectionLimit;
    return limit > 0 ? items.slice(0, limit) : items;
  });

  readonly hasMoreChips = computed(() => {
    const items = this.selectedItems();
    const limit = this.config().selectionLimit;
    return limit > 0 && items.length > limit;
  });

  readonly remainingChipsCount = computed(() => {
    const items = this.selectedItems();
    const limit = this.config().selectionLimit;
    return Math.max(0, items.length - limit);
  });

  // Computed CSS custom properties for dynamic styling
  readonly hostStyles = computed(() => {
    const config = this.config();
    const styles: { [key: string]: string } = {};

    this.applyChipStyles(styles, config);
    this.applyDropdownStyles(styles, config);
    this.applyInputStyles(styles, config);

    return styles;
  });

  // Helper methods for hostStyles to reduce cognitive complexity
  private applyChipStyles(styles: { [key: string]: string }, config: TypeaheadConfig): void {
    if (!config.chipColors) return;

    const { chipColors } = config;
    if (chipColors.background) styles['--chip-bg'] = chipColors.background;
    if (chipColors.text) styles['--chip-text'] = chipColors.text;
    if (chipColors.border) styles['--chip-border'] = chipColors.border;
    if (chipColors.hoverBackground) styles['--chip-hover-bg'] = chipColors.hoverBackground;
    if (chipColors.hoverText) styles['--chip-hover-text'] = chipColors.hoverText;
    if (chipColors.removeHover) styles['--chip-remove-hover'] = chipColors.removeHover;
  }

  private applyDropdownStyles(styles: { [key: string]: string }, config: TypeaheadConfig): void {
    if (!config.dropdownColors) return;

    const { dropdownColors } = config;
    if (dropdownColors.highlightBackground) styles['--highlight-bg'] = dropdownColors.highlightBackground;
    if (dropdownColors.highlightText) styles['--highlight-text'] = dropdownColors.highlightText;
    if (dropdownColors.selectedBackground) styles['--selected-bg'] = dropdownColors.selectedBackground;
    if (dropdownColors.selectedText) styles['--selected-text'] = dropdownColors.selectedText;
    if (dropdownColors.hoverBackground) styles['--option-hover-bg'] = dropdownColors.hoverBackground;
    if (dropdownColors.hoverText) styles['--option-hover-text'] = dropdownColors.hoverText;
  }

  private applyInputStyles(styles: { [key: string]: string }, config: TypeaheadConfig): void {
    if (!config.inputColors) return;

    const { inputColors } = config;
    if (inputColors.focusBorder) styles['--focus-border'] = inputColors.focusBorder;
    if (inputColors.focusShadow) styles['--focus-shadow'] = inputColors.focusShadow;
  }

  // Optimized track by function
  readonly trackByOptimized: TrackByFunction<TypeaheadOption> = (index: number, option: TypeaheadOption) => {
    return option.value ?? option.label ?? index;
  };

  // Form control for search input
  searchControl = new FormControl('');

  // RxJS subjects
  private readonly destroy$ = new Subject<void>();
  private readonly focusSubject = new BehaviorSubject<boolean>(false);
  private readonly searchSubject = new Subject<string>();
  private readonly batchUpdateSubject = new Subject<void>();
  private readonly gcSubject = new Subject<void>();
  private readonly cancelSearch$ = new Subject<void>(); // For canceling ongoing searches
  private readonly searchRequest$ = new Subject<string>(); // For enhanced search control

  // Internal state
  private onChange = (value: any) => {};
  private onTouched = () => {};
  readonly instanceId = Math.random().toString(36).substring(2);
  dropdownId = `rm-typeahead-dropdown-${this.instanceId}`;

  // Performance optimization state
  private readonly optionCache = new Map<string, { data: TypeaheadOption[], timestamp: number }>();
  private readonly renderQueue: (() => void)[] = [];
  private isProcessingQueue = false;
  private lastGc = Date.now();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly injector: Injector,
    private readonly sanitizer: DomSanitizer
  ) {
    // Effect to handle option highlighting with performance optimization
    effect(() => {
      const config = this.config();
      const options = this.visibleOptions();
      const currentIndex = config.virtualScrolling ?
        this.virtualHighlightedIndex() : this.highlightedIndex();

      if (config.highlightFirst && options.length > 0 && currentIndex === -1) {
        this.setHighlightedIndex(0);
      }
    });

    // Effect to sync visible options with filtered options
    effect(() => {
      const filtered = this.filteredOptions();
      const config = this.config();

      if (config.batchSize && filtered.length > config.batchSize) {
        this.batchUpdate(() => {
          this.visibleOptions.set(filtered.slice(0, config.maxResults || 10));
        });
      } else {
        this.visibleOptions.set(filtered);
      }
    });

    // Effect for garbage collection
    effect(() => {
      if (this.config().enableGc) {
        this.scheduleGarbageCollection();
      }
    });
  }

  ngOnInit(): void {
    this.setupSearchStream();
    this.setupKeyboardNavigation();
    this.setupBatchUpdates();
    this.setupGarbageCollection();

    // Handle default value initialization
    if (this.defaultValue !== undefined) {
      this.initializeWithDefaultValue();
    }
  }

  ngAfterViewInit(): void {
    // Initialize virtual scrolling if enabled
    if (this.config().virtualScrolling && this.virtualScrollViewport) {
      this.setupVirtualScrolling();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && !changes['options'].firstChange) {
      this.handleStaticOptions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cancelSearch$.complete();
    this.searchRequest$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (this.config().multiSelect) {
      // Handle multi-select mode
      if (Array.isArray(value)) {
        const selectedOptions = value
          .map(val => this.findOptionByValue(val))
          .filter((option): option is TypeaheadOption => option !== null);
        this.selectedItems.set(selectedOptions);
      } else {
        this.selectedItems.set([]);
      }
      // In multi-select, keep search field empty for new searches
      this.searchControl.setValue('', { emitEvent: false });
    } else {
      // Handle single-select mode (existing behavior)
      this.selectedValue.set(value);
      if (value) {
        const option = this.findOptionByValue(value);
        if (option) {
          this.searchControl.setValue(option.label, { emitEvent: false });
        }
      } else {
        this.searchControl.setValue('', { emitEvent: false });
      }
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.inputDisabled = isDisabled;
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }

  // Public methods
  clear(): void {
    this.searchControl.setValue('');
    this.selectedValue.set(null);
    this.onChange(null);
    this.close();
    this.inputElement.nativeElement.focus();
  }

  focus(): void {
    this.inputElement.nativeElement.focus();
  }

  // Enhanced public methods for search control
  cancelCurrentSearch(): void {
    this.cancelSearch$.next();
    this.loading.set(false);
    if (this.config().announceLoading) {
      this.announceToScreenReader('Search cancelled', 'polite');
    }
  }

  performSearch(term: string): void {
    this.searchControl.setValue(term);
    this.handleSearch(term);
  }

  open(): void {
    if (!this.disabled() && !this.isOpen()) {
      this.isOpen.set(true);
      this.opened.emit();
    }
  }

  close(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.highlightedIndex.set(-1);
      this.closed.emit();
    }
  }

  // Accessibility methods
  getAriaDescribedBy(): string {
    const describedBy = [`${this.instanceId}-instructions`];

    if (this.config().ariaDescribedBy) {
      describedBy.push(this.config().ariaDescribedBy!);
    }

    if (this.isOpen() && this.visibleOptions().length > 0) {
      describedBy.push(`${this.instanceId}-live-region`);
    }

    return describedBy.join(' ');
  }

  getClearButtonAriaLabel(): string {
    const currentValue = this.searchControl.value;
    return currentValue ? `Clear selection: ${currentValue}` : 'Clear selection';
  }

  getDropdownAriaLabel(): string {
    const count = this.visibleOptions().length;
    const searchTerm = this.searchControl.value;

    if (searchTerm) {
      return `${count} results for "${searchTerm}"`;
    }

    return `${count} available options`;
  }

  getOptionAriaLabel(option: TypeaheadOption, index: number): string {
    const position = `${index + 1} of ${this.visibleOptions().length}`;
    const selected = this.isSelected(option) ? ', selected' : '';
    const disabled = option.disabled ? ', disabled' : '';

    return `${option.label}, ${position}${selected}${disabled}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    // Announce input for screen readers (debounced)
    if (this.config().announceResults) {
      this.debounceAnnouncement(`Typing: ${value}`, 'polite');
    }
  }

  private debounceAnnouncement(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const now = Date.now();
    const debounceTime = this.config().screenReaderDebounce || 500;

    if (now - this.lastAnnouncementTime() > debounceTime) {
      this.announceToScreenReader(message, priority);
      this.lastAnnouncementTime.set(now);
    }
  }

  private announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.config().announceResults) return;

    this.currentAnnouncement.set(message);

    // Clear announcement after a delay to allow for new announcements
    setTimeout(() => {
      if (this.currentAnnouncement() === message) {
        this.currentAnnouncement.set('');
      }
    }, 1000);
  }

  private announceResults(count: number, searchTerm: string): void {
    if (!this.config().announceResults) return;

    let message = '';
    if (count === 0) {
      message = this.config().announceNoResults ?
        `No results found for "${searchTerm}"` : '';
    } else if (this.config().resultCountAnnouncement) {
      const resultText = count === 1 ? 'result' : 'results';
      message = `${count} ${resultText} available for "${searchTerm}"`;
    }

    if (message) {
      this.announceToScreenReader(message, 'polite');
    }
  }

  private announceSelection(option: TypeaheadOption): void {
    if (!this.config().announceSelection) return;

    const message = `Selected: ${option.label}`;
    this.announceToScreenReader(message, 'assertive');
  }

  private announceNavigation(option: TypeaheadOption, position: number, total: number): void {
    if (!this.config().navigationAnnouncement) return;

    const message = `${option.label}, ${position} of ${total}`;
    this.announceToScreenReader(message, 'polite');
  }

  private announceCurrentSelection(): void {
    const options = this.visibleOptions();
    const index = this.config().virtualScrolling ?
      this.virtualHighlightedIndex() : this.highlightedIndex();

    if (index >= 0 && index < options.length) {
      const option = options[index];
      this.announceNavigation(option, index + 1, options.length);
    }
  }

  private navigateByPage(direction: number): void {
    const currentIndex = this.config().virtualScrolling ?
      this.virtualHighlightedIndex() : this.highlightedIndex();
    const options = this.visibleOptions();

    let newIndex = currentIndex + direction;
    newIndex = Math.max(0, Math.min(newIndex, options.length - 1));

    this.setHighlightedIndex(newIndex);
  }

  // Event handlers
  onFocus(): void {
    this.focusSubject.next(true);

    const currentValue = this.searchControl.value || '';
    const config = this.config();

    // Enhanced focus behavior
    if (config.searchOnFocus) {
      // Search on focus regardless of current value
      if (currentValue.length >= config.minLength || config.searchOnEmpty) {
        this.handleSearch(currentValue);
      } else if (!this.searchFn && this.options.length > 0) {
        // For static options, show all options on focus if searchOnFocus is enabled
        this.open();
        this.handleStaticOptions('');
      }
    } else if (currentValue.length >= config.minLength) {
      // Original behavior: only open if we have content and meet minimum length
      this.handleSearch(currentValue);
    }
  }

  onBlur(event: FocusEvent): void {
    // Delay to allow click events to fire first
    setTimeout(() => {
      // Check if focus moved to another element within our component
      if (!this.isClickWithinComponent(event.relatedTarget as Element)) {
        this.focusSubject.next(false);
        this.close();
        this.onTouched();
      }
    }, 100); // Reduced delay for better responsiveness
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    const handled = this.handleNavigationKeys(event) ||
                   this.handleActionKeys(event) ||
                   this.handleShortcutKeys(event);

    if (handled) {
      event.preventDefault();
    }
  }

  private handleNavigationKeys(event: KeyboardEvent): boolean {
    switch (event.key) {
      case 'ArrowDown':
        this.navigateDown();
        this.announceCurrentSelection();
        return true;
      case 'ArrowUp':
        this.navigateUp();
        this.announceCurrentSelection();
        return true;
      default:
        return false;
    }
  }

  private handleActionKeys(event: KeyboardEvent): boolean {
    switch (event.key) {
      case 'Enter':
        if (this.config().selectOnEnter) {
          this.selectHighlightedOption();
        }
        return true;
      case 'Tab':
        if (this.config().selectOnTab && this.isOpen()) {
          this.selectHighlightedOption();
        }
        return false; // Don't prevent default for Tab
      case 'Escape':
        this.close();
        this.announceToScreenReader('Closed dropdown', 'polite');
        return true;
      default:
        return false;
    }
  }

  private handleShortcutKeys(event: KeyboardEvent): boolean {
    if (!this.config().keyboardShortcuts || !this.isOpen()) {
      return false;
    }

    switch (event.key) {
      case 'Home':
        this.setHighlightedIndex(0);
        this.announceCurrentSelection();
        return true;
      case 'End': {
        const lastIndex = this.visibleOptions().length - 1;
        this.setHighlightedIndex(lastIndex);
        this.announceCurrentSelection();
        return true;
      }
      case 'PageDown':
        this.navigateByPage(5);
        this.announceCurrentSelection();
        return true;
      case 'PageUp':
        this.navigateByPage(-5);
        this.announceCurrentSelection();
        return true;
      default:
        return false;
    }
  }

  selectOption(option: TypeaheadOption): void {
    if (option.disabled) return;

    const config = this.config();
    this.justSelected.set(true);

    if (config.multiSelect) {
      this.handleMultiSelectOption(option, config);
    } else {
      this.handleSingleSelectOption(option, config);
    }

    this.finalizeSelection(config);
  }

  private handleMultiSelectOption(option: TypeaheadOption, config: TypeaheadConfig): void {
    const currentItems = this.selectedItems();
    const isAlreadySelected = currentItems.some(item => item.value === option.value);

    if (isAlreadySelected && !config.allowDuplicates) {
      this.removeFromMultiSelect(option, currentItems, config);
    } else {
      this.addToMultiSelect(option, currentItems, config);
    }

    this.handleMultiSelectDropdown(config);
  }

  private removeFromMultiSelect(option: TypeaheadOption, currentItems: TypeaheadOption[], config: TypeaheadConfig): void {
    const newItems = currentItems.filter(item => item.value !== option.value);
    this.selectedItems.set(newItems);
    this.chipRemoved.emit(option);
    this.selectionChanged.emit(newItems);
    this.onChange(newItems.map(item => item.value));

    if (config.announceSelection) {
      this.announceToScreenReader(`Removed: ${option.label}`, 'polite');
    }
  }

  private addToMultiSelect(option: TypeaheadOption, currentItems: TypeaheadOption[], config: TypeaheadConfig): void {
    if ((config.maxSelections ?? 0) > 0 && currentItems.length >= (config.maxSelections ?? 0)) {
      if (config.announceSelection) {
        this.announceToScreenReader(`Maximum selections reached: ${config.maxSelections}`, 'assertive');
      }
      return;
    }

    const newItems = [...currentItems, option];
    this.selectedItems.set(newItems);
    this.optionSelected.emit(option);
    this.selectionChanged.emit(newItems);
    this.onChange(newItems.map(item => item.value));
    this.announceSelection(option);
  }

  private handleMultiSelectDropdown(config: TypeaheadConfig): void {
    // Always clear search input after multi-select selection
    this.searchControl.setValue('', { emitEvent: false });

    if (config.closeOnSelect) {
      this.close();
    } else {
      // Keep dropdown open but reset search
      this.handleSearch('');
    }
  }

  private handleSingleSelectOption(option: TypeaheadOption, config: TypeaheadConfig): void {
    this.selectedValue.set(option.value);
    // For single select, keep the selected label in the input
    this.searchControl.setValue(option.label, { emitEvent: false });
    this.onChange(option.value);
    this.optionSelected.emit(option);
    this.announceSelection(option);
    this.close();
  }

  private finalizeSelection(config: TypeaheadConfig): void {
    setTimeout(() => {
      this.justSelected.set(false);
    }, 100);

    if (config.focusManagement) {
      setTimeout(() => {
        this.inputElement.nativeElement.focus();
      }, 0);
    }
  }

  setHighlightedIndex(index: number): void {
    const maxIndex = this.filteredOptions().length - 1;
    if (index >= 0 && index <= maxIndex) {
      this.highlightedIndex.set(index);
    }
  }

  trackByFn(index: number, option: TypeaheadOption): any {
    return option.value;
  }

  isSelected(option: TypeaheadOption): boolean {
    if (this.config().multiSelect) {
      return this.selectedItems().some(item => item.value === option.value);
    }
    return option.value === this.selectedValue();
  }

  // Multi-select methods
  getChipClasses(): string {
    const config = this.config();
    return [
      'rm-typeahead__chip',
      `rm-typeahead__chip--${config.chipStyle}`,
      `rm-typeahead__chip--${config.chipSize}`
    ].join(' ');
  }

  removeChip(item: TypeaheadOption, event: Event): void {
    event.stopPropagation();
    const items = this.selectedItems();
    const newItems = items.filter(selected => selected.value !== item.value);
    this.selectedItems.set(newItems);
    this.chipRemoved.emit(item);
    this.selectionChanged.emit(newItems);

    // Announce removal for screen readers
    if (this.config().announceSelection) {
      this.announceToScreenReader(`Removed: ${item.label}`, 'polite');
    }

    // Update form control value
    if (this.config().multiSelect) {
      this.onChange(newItems.map(i => i.value));
    }
  }

  getRemainingChipsLabel(): string {
    const count = this.remainingChipsCount();
    return `${count} additional selected item${count === 1 ? '' : 's'}`;
  }

  getOptionId(index: number): string {
    return `${this.dropdownId}-option-${index}`;
  }

  getHighlightedText(text: string, searchTerm: string | null): SafeHtml {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.sanitizer.bypassSecurityTrustHtml(text);
    }

    const trimmedTerm = searchTerm.trim();
    const regex = new RegExp(`(${this.escapeRegExp(trimmedTerm)})`, 'gi');

    // Use configurable colors for search term highlighting
    const highlightBg = this.config().dropdownColors?.searchHighlightBackground || '#ffa726'; // Orange background
    const highlightColor = this.config().dropdownColors?.searchHighlightText || '#000000';

    const result = text.replace(regex,
      `<span style="background-color: ${highlightBg}; color: ${highlightColor}; font-weight: 600;">$1</span>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(result);
  }

  /**
   * Initialize the component with a default value
   */
  initializeWithDefaultValue(): void {
    if (this.defaultValue === undefined) return;

    if (this.config().multiSelect) {
      // Handle multi-select default values
      if (Array.isArray(this.defaultValue)) {
        const defaultOptions = this.defaultValue
          .map(val => this.findOptionByValue(val))
          .filter((option): option is TypeaheadOption => option !== null);

        this.selectedItems.set(defaultOptions);
        this.onChange(this.defaultValue);
      }
    } else {
      // Handle single-select default value
      const defaultOption = this.findOptionByValue(this.defaultValue);
      if (defaultOption) {
        this.selectedValue.set(this.defaultValue);
        // Use defaultLabel if provided, otherwise use option label
        const displayLabel = this.defaultLabel || defaultOption.label;
        this.searchControl.setValue(displayLabel, { emitEvent: false });
        this.onChange(this.defaultValue);
      } else if (this.defaultLabel) {
        // If no matching option found but defaultLabel provided, use it for display
        this.searchControl.setValue(this.defaultLabel, { emitEvent: false });
        this.selectedValue.set(this.defaultValue);
        this.onChange(this.defaultValue);
      }
    }
  }

  // Private methods
  private setupSearchStream(): void {
    // Enhanced search stream with better request cancellation and throttling
    const searchStream$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    // Choose between debounce and throttle based on configuration
    const processedStream$ = this.config().throttleTime > 0 ?
      searchStream$.pipe(throttleTime(this.config().throttleTime)) :
      searchStream$.pipe(debounceTime(this.config().debounceTime));

    // Enhanced search with cancellation support
    processedStream$.pipe(
      // Cancel previous search if enabled
      tap(() => {
        if (this.config().cancelPreviousRequests) {
          this.cancelSearch$.next();
        }
      }),
      switchMap((searchTerm: string | null) => {
        const term = searchTerm || '';
        this.searchChanged.emit(term);
        this.searchSubject.next(term);

        // Handle empty search based on configuration
        if (term.length === 0 && !this.config().searchOnEmpty) {
          this.filteredOptions.set([]);
          this.close();
          return of(null);
        }

        // Return observable for further processing
        return of(term);
      }),
      filter((term): term is string => term !== null),
      takeUntil(this.destroy$)
    ).subscribe((term: string) => {
      this.handleSearch(term);
    });
  }

  private setupKeyboardNavigation(): void {
    // Additional keyboard navigation setup if needed
  }

  private handleSearch(searchTerm: string): void {
    if (searchTerm.length < this.config().minLength) {
      this.filteredOptions.set([]);
      this.showNoResults.set(false);
      this.close();
      return;
    }

    // Don't open dropdown if we just made a selection
    if (this.justSelected()) {
      return;
    }

    // Always open dropdown when search criteria is met
    this.open();

    // Check cache first for performance
    const cached = this.getCachedResults(searchTerm);
    if (cached) {
      this.filteredOptions.set(cached);
      this.showNoResults.set(cached.length === 0);
      this.highlightedIndex.set(this.config().highlightFirst && cached.length > 0 ? 0 : -1);
      return;
    }

    if (this.searchFn) {
      this.handleAsyncSearch(searchTerm);
    } else {
      this.handleStaticOptions(searchTerm);
    }
  }

  private handleAsyncSearch(searchTerm: string): void {
    if (!this.searchFn) return;

    this.loading.set(true);
    this.showNoResults.set(false);
    this.lastSearchTerm.set(searchTerm);

    // Announce loading state
    if (this.config().announceLoading) {
      this.announceToScreenReader('Loading results', 'polite');
    }

    this.searchFn(searchTerm)
      .pipe(
        // Add timeout if configured
        this.config().searchTimeout > 0 ?
          timeout(this.config().searchTimeout) :
          tap(), // No-op if no timeout
        // Add retry with delay if configured
        this.config().retryAttempts > 0 ?
          retry({
            count: this.config().retryAttempts,
            delay: this.config().retryDelay
          }) :
          tap(), // No-op if no retry
        map(options => options.slice(0, this.config().maxResults)),
        // Enhanced error handling with user feedback
        catchError((error) => {
          console.warn('Typeahead search failed:', error);
          if (this.config().announceLoading) {
            this.announceToScreenReader('Search failed, please try again', 'assertive');
          }
          return of([]);
        }),
        // Cancel on new search if enabled
        takeUntil(this.config().cancelPreviousRequests ?
          merge(this.destroy$, this.cancelSearch$) :
          this.destroy$),
        // Cache results and handle loading state
        tap(options => {
          this.setCachedResults(searchTerm, options);
        }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe(options => {
        // Only update if this is still the current search term
        if (this.lastSearchTerm() === searchTerm) {
          this.filteredOptions.set(options);
          this.showNoResults.set(options.length === 0);
          this.highlightedIndex.set(this.config().highlightFirst && options.length > 0 ? 0 : -1);

          // Announce results for screen readers
          this.announceResults(options.length, searchTerm);

          this.cdr.markForCheck();
        }
      });
  }

  private handleStaticOptions(searchTerm?: string): void {
    const term = searchTerm || this.searchControl.value || '';

    if (term.length >= this.config().minLength) {
      // Check cache first
      const cached = this.getCachedResults(term);
      if (cached) {
        this.filteredOptions.set(cached);
        this.showNoResults.set(cached.length === 0);
        this.highlightedIndex.set(this.config().highlightFirst && cached.length > 0 ? 0 : -1);

        // Announce cached results
        this.announceResults(cached.length, term);
        return;
      }

      const filtered = this.options
        .filter(option =>
          option.label.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, this.config().maxResults);

      // Cache the results
      this.setCachedResults(term, filtered);

      this.filteredOptions.set(filtered);
      this.showNoResults.set(filtered.length === 0);
      this.highlightedIndex.set(this.config().highlightFirst && filtered.length > 0 ? 0 : -1);

      // Announce results for screen readers
      this.announceResults(filtered.length, term);
    } else {
      this.filteredOptions.set([]);
      this.showNoResults.set(false);
    }
  }

  private navigateDown(): void {
    const currentIndex = this.highlightedIndex();
    const maxIndex = this.filteredOptions().length - 1;

    if (currentIndex < maxIndex) {
      this.setHighlightedIndex(currentIndex + 1);
    } else {
      this.setHighlightedIndex(0); // Wrap to first
    }
  }

  private navigateUp(): void {
    const currentIndex = this.highlightedIndex();
    const maxIndex = this.filteredOptions().length - 1;

    if (currentIndex > 0) {
      this.setHighlightedIndex(currentIndex - 1);
    } else {
      this.setHighlightedIndex(maxIndex); // Wrap to last
    }
  }

  private selectHighlightedOption(): void {
    const index = this.highlightedIndex();
    const options = this.filteredOptions();

    if (index >= 0 && index < options.length) {
      this.selectOption(options[index]);
    }
  }

  private findOptionByValue(value: any): TypeaheadOption | null {
    return this.options.find(option => option.value === value) || null;
  }

  private isClickWithinComponent(target: Element | null): boolean {
    if (!target) return false;
    const component = this.inputElement.nativeElement.closest('.rm-typeahead');
    return component?.contains(target) || false;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Performance optimization methods
  private batchUpdate(fn: () => void): void {
    this.renderQueue.push(fn);
    if (!this.isProcessingQueue) {
      this.processRenderQueue();
    }
  }

  private processRenderQueue(): void {
    this.isProcessingQueue = true;

    // Use requestAnimationFrame for optimal rendering
    requestAnimationFrame(() => {
      const batchSize = this.config().batchSize || 100;
      const itemsToProcess = this.renderQueue.splice(0, batchSize);

      itemsToProcess.forEach(fn => fn());

      if (this.renderQueue.length > 0) {
        this.processRenderQueue();
      } else {
        this.isProcessingQueue = false;
        this.cdr.markForCheck();
      }
    });
  }

  private setupBatchUpdates(): void {
    this.batchUpdateSubject.pipe(
      debounceTime(16), // ~60fps
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  private setupVirtualScrolling(): void {
    if (!this.virtualScrollViewport) return;

    // Setup virtual scroll event handlers
    this.virtualScrollViewport.scrolledIndexChange.pipe(
      takeUntil(this.destroy$)
    ).subscribe((index: number) => {
      this.virtualHighlightedIndex.set(index);
    });

    // Preload items for smooth scrolling
    this.virtualScrollViewport.renderedRangeStream.pipe(
      takeUntil(this.destroy$)
    ).subscribe(range => {
      const preloadOffset = this.config().preloadOffset || 5;
      const startIndex = Math.max(0, range.start - preloadOffset);
      const endIndex = Math.min(this.visibleOptions().length, range.end + preloadOffset);

      // Trigger preloading if needed
      if (this.config().lazyLoading) {
        this.preloadItems(startIndex, endIndex);
      }
    });
  }

  private preloadItems(startIndex: number, endIndex: number): void {
    // Implementation for lazy loading items in the specified range
    // This would be used for very large datasets with async loading
    const currentOptions = this.visibleOptions();
    const itemsToLoad = currentOptions.slice(startIndex, endIndex);

    // Trigger any additional loading logic here
    if (itemsToLoad.length > 0) {
      this.batchUpdateSubject.next();
    }
  }

  private setupGarbageCollection(): void {
    if (!this.config().enableGc) return;

    this.gcSubject.pipe(
      debounceTime(this.config().gcInterval || 60000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.performGarbageCollection();
    });
  }

  private scheduleGarbageCollection(): void {
    const now = Date.now();
    const gcInterval = this.config().gcInterval || 60000;

    if (now - this.lastGc > gcInterval) {
      this.gcSubject.next();
      this.lastGc = now;
    }
  }

  private performGarbageCollection(): void {
    const now = Date.now();
    const maxAge = this.config().maxCacheAge || 300000; // 5 minutes
    const maxSize = this.config().cacheSize || 1000;

    // Clean up old cache entries
    for (const [key, entry] of this.optionCache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.optionCache.delete(key);
      }
    }

    // Limit cache size
    if (this.optionCache.size > maxSize) {
      const entries = Array.from(this.optionCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.slice(0, entries.length - maxSize);
      toRemove.forEach(([key]) => this.optionCache.delete(key));
    }

    // Update cache signal
    this.cacheMap.set(new Map(this.optionCache));
  }

  private getCachedResults(searchTerm: string): TypeaheadOption[] | null {
    if (!this.config().enableCaching) return null;

    const cached = this.optionCache.get(searchTerm);
    if (cached) {
      const now = Date.now();
      const maxAge = this.config().maxCacheAge || 300000;

      if (now - cached.timestamp < maxAge) {
        return cached.data;
      } else {
        this.optionCache.delete(searchTerm);
      }
    }

    return null;
  }

  private setCachedResults(searchTerm: string, results: TypeaheadOption[]): void {
    if (!this.config().enableCaching) return;

    this.optionCache.set(searchTerm, {
      data: [...results], // Clone to prevent mutations
      timestamp: Date.now()
    });
  }
}
