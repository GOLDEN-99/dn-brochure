import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { WarehouseService } from '../../service/ibob/warehouse.service';

@Component({
  selector: 'app-in-out-nav',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <section class="form-wrapper">
      <div style="display: flex; gap: 16px">
      @for (warehouse of warehouseList(); track $index) {
          <a
            [routerLink]="warehouse.id"
            queryParamsHandling="preserve"
            routerLinkActive="active"
            class="btn btn-outline-success"
            style="flex: 1 1 auto"
            role="button"
            >{{ warehouse.name }}</a
          >
      }
      </div>
      <router-outlet />
    </section>
    <div style="text-align: center; margin: 0; opacity: 0.2">version 1.0</div>
  `,
  styles: `
    .form-wrapper {
      margin: auto;
      padding: 1rem;
      width: 100%;
      @media (min-width: 992px) {
        width: 920px;
      }
    }
  `
})
export class InOutNavComponent {
  private warehouseServ = inject(WarehouseService)
  warehouseList = this.warehouseServ.warehouseList
}
