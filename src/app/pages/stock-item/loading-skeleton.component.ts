import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  imports: [],
  template: `
    <div class="placeholder-glow d-flex" style="flex-direction: column">
      @for (item of rowArray(); track $index) {
        <span [classList]="item" style="height: 24px"></span>
      }
    </div>
  `,
  styles: ``
})
export class LoadingSkeletonComponent {
  row = input(12)
  rowArray = computed(() => {
    return Array.from({ length: this.row() }).map((_) => {
      const ranInt = Math.random()
      return `placeholder my-2 col-${Math.ceil(ranInt * 12)}`
    })
  })

}
