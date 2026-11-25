import { Route } from '@angular/router';
import { WAREHOUSE_ROUTES } from '../warehouse/warehouse.routes';
import { OtherIncomeEmplGateComponent } from '../../other-income/shared/components/other-income-empl-gate/other-income-empl-gate.component';
import { otherIncomeEmplAuthGuard } from '../../other-income/shared/guards/other-income-empl-auth.guard';

/**
 * Goods-receiving slots. Opened as `/inbound-outbound/warehouse/board?emplCode=<emplCode>`, the same
 * hand-over as Other Income v2: the guard resolves the employee and the gate blocks the page when
 * there is none. Check-ins record that employee.
 *
 * Purchasing (arrival memo) and supplier (confirmation page) routes mount here later, beside
 * WAREHOUSE_ROUTES.
 */
export const INBOUND_OUTBOUND_ROUTES: Route[] = [
  {
    path: 'inbound-outbound',
    title: 'รับสินค้าเข้าคลัง',
    component: OtherIncomeEmplGateComponent,
    canActivate: [otherIncomeEmplAuthGuard],
    children: [
      WAREHOUSE_ROUTES,
    ],
  },
];
