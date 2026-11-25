import { Route } from '@angular/router';
import { handleLazyLoadError } from '../../utils/lazy-load-error-handler';

/** Warehouse role: gate-house check-in, queue, gate assignment. */
export const WAREHOUSE_ROUTES: Route = {
  path: 'warehouse',
  children: [
    {
      path: '',
      redirectTo: 'board',
      pathMatch: 'full',
    },
    {
      path: 'board',
      title: 'คิวรับสินค้า',
      loadComponent: () => import('./components/pages/receiving-board-page/receiving-board-page.component')
        .then(c => c.ReceivingBoardPageComponent)
        .catch(handleLazyLoadError('inbound-outbound warehouse board')),
    },
  ],
}
