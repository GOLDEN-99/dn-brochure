import { Component, inject } from '@angular/core';
import { OrderContractContextService } from '../../../../purchase/services/order-contract-context.service';
import { PaginatedListComponent } from '../../../../../shared/components/paginated-list/paginated-list.component';

@Component({
  selector: 'app-order-contract-specs-page',
  imports: [PaginatedListComponent],
  templateUrl: './order-contract-specs-page.component.html',
  styles: '',
})
export class OrderContractSpecsPageComponent {
  readonly ctx = inject(OrderContractContextService)
}
