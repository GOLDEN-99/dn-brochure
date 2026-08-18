import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatedListComponent } from './paginated-list.component';

@Component({
  selector: 'app-paginated-list-test-host',
  imports: [PaginatedListComponent],
  template: `
    <app-paginated-list [items]="items" [pageSize]="pageSize">
      <ng-template #row let-item let-index="index">
        <span class="item">{{ index }}: {{ item }}</span>
      </ng-template>
    </app-paginated-list>
  `,
})
class TestHostComponent {
  items: string[] = [];
  pageSize = 2;
}

describe('PaginatedListComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  function renderedItems(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.item'))
      .map((el) => (el as HTMLElement).textContent?.trim() ?? '');
  }

  function paginationButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.pagination button'));
  }

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders nothing and no pagination when the list is empty', () => {
    host.items = [];
    fixture.detectChanges();

    expect(renderedItems()).toEqual([]);
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('renders all items on one page when they fit within pageSize', () => {
    host.items = ['a', 'b'];
    host.pageSize = 2;
    fixture.detectChanges();

    expect(renderedItems()).toEqual(['0: a', '1: b']);
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('paginates items and shows page controls when exceeding pageSize', () => {
    host.items = ['a', 'b', 'c', 'd', 'e'];
    host.pageSize = 2;
    fixture.detectChanges();

    expect(renderedItems()).toEqual(['0: a', '1: b']);
    expect(paginationButtons().length).toBe(3); // ceil(5/2) = 3 pages
  });

  it('navigates to the clicked page and shows the correct slice', () => {
    host.items = ['a', 'b', 'c', 'd', 'e'];
    host.pageSize = 2;
    fixture.detectChanges();

    paginationButtons()[2].click(); // page index 2 -> third page
    fixture.detectChanges();

    expect(renderedItems()).toEqual(['0: e']);
  });

  it('marks the current page button as active', () => {
    host.items = ['a', 'b', 'c', 'd'];
    host.pageSize = 2;
    fixture.detectChanges();

    paginationButtons()[1].click();
    fixture.detectChanges();

    const buttons = paginationButtons();
    expect(buttons[0].className).not.toContain('active');
    expect(buttons[1].className).toContain('active');
  });
});
