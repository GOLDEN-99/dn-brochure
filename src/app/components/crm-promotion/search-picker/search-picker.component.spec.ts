import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SearchPickerComponent } from './search-picker.component';

type TItem = { id: number; name: string };

describe('SearchPickerComponent', () => {
  let fixture: ComponentFixture<SearchPickerComponent<TItem>>;
  let input: HTMLInputElement;
  let picked: TItem[];

  const items: TItem[] = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Alphabet' },
  ];

  const results = () =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('ngb-typeahead-window button'));

  const create = (extra: Record<string, unknown> = {}) => {
    fixture = TestBed.createComponent(SearchPickerComponent<TItem>);
    fixture.componentRef.setInput('inputId', 'picker');
    fixture.componentRef.setInput('label', 'Picker');
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('searchBy', (i: TItem) => i.name);
    fixture.componentRef.setInput('format', (i: TItem) => `#${i.id} ${i.name}`);
    Object.entries(extra).forEach(([k, v]) => fixture.componentRef.setInput(k, v));
    picked = [];
    fixture.componentInstance.picked.subscribe(i => picked.push(i));
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
  };

  const type = (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const pickFirst = () => {
    results()[0].click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPickerComponent],
    }).compileComponents();
  });

  afterEach(() => fixture.destroy());

  it('opens with every item on focus', () => {
    create();

    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(results().map(b => b.textContent?.trim())).toEqual(['#1 Alpha', '#2 Beta', '#3 Alphabet']);
  });

  it('filters case-insensitively and applies the limit', () => {
    create({ limit: 1 });

    type('ALPHA');

    expect(results().map(b => b.textContent?.trim())).toEqual(['#1 Alpha']);
  });

  it('emits the picked item and clears the input', () => {
    create();

    type('bet');
    pickFirst();

    expect(picked).toEqual([items[1]]);
    expect(input.value).toBe('');
  });

  it('searches again when the same text is retyped after a pick', () => {
    create();
    type('bet');
    pickFirst();

    type('bet');

    expect(results().length).toBe(2);
  });

  it('reopens on click after a pick closed the popup', () => {
    create();
    type('bet');
    pickFirst();

    input.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(results().length).toBe(3);
  });

  it('waits for the debounce before searching', fakeAsync(() => {
    create({ debounce: 300 });

    type('beta');
    expect(results().length).toBe(0);

    tick(300);
    fixture.detectChanges();
    expect(results().length).toBe(1);
  }));
});
