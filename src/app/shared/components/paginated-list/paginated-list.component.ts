import { ChangeDetectionStrategy, Component, computed, contentChild, input, signal, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-paginated-list',
  imports: [NgTemplateOutlet],
  templateUrl: './paginated-list.component.html',
  styleUrl: './paginated-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatedListComponent<T> {
  readonly items = input.required<readonly T[]>();
  readonly pageSize = input<number>(10);
  readonly rowTemplate = contentChild.required(TemplateRef);

  readonly page = signal(0);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.items().length / this.pageSize())),
  );

  readonly pagedItems = computed(() => {
    const size = this.pageSize();
    const currentPage = Math.min(this.page(), this.totalPages() - 1);
    return this.items().slice(currentPage * size, (currentPage + 1) * size);
  });

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i),
  );

  setPage(page: number): void {
    this.page.set(page);
  }
}
