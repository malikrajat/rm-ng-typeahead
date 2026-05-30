import { TestBed } from '@angular/core/testing';

import { TypeaheadComponent } from './rm-ng-typeahead';

describe('RmNgTypeahead Library', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadComponent]
    }).compileComponents();
  });

  it('should export TypeaheadComponent', () => {
    expect(TypeaheadComponent).toBeDefined();
  });

  it('should create TypeaheadComponent instance', () => {
    const fixture = TestBed.createComponent(TypeaheadComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
