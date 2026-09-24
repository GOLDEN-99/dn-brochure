import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { PurchaseReportComponent } from './purchase-report.component';
import { OiAccountReportService } from '../../../../service/other-income/oi-account-report.service';
import { SupplierReportService } from '../../../../service/other-income/supplier-report.service';
import { LoadingService } from '../../../../service/loading/loading.service';
import { ToastService } from '../../../../service/toast/toast.service';

// [component method, OiAccountReportService method it calls]
const EXPORTS: Array<[keyof PurchaseReportComponent, string]> = [
  ['exportInvoice', 'exportInvoiceReport'],
  ['exportCredit', 'exportInvoiceReport'],
  ['exportRece', 'exportReceiptReport'],
  ['exportLight', 'exportLightReport'],
  ['exportAnnualIncomeReport', 'exportAnnualIncomeReport'],
  ['exportMonthBuy', 'exportMonthbuyReport'],
  ['exportMonthInce', 'exportInceReport'],
  ['exportRangeBill', 'exportBillReport'],
  ['exportRangeProduct', 'exportProductReport'],
  ['exportRangeInvRece', 'exportInvReceReport'],
  ['exportRangeCredit', 'exportCreditReport'],
];

describe('PurchaseReportComponent', () => {
  let component: PurchaseReportComponent;
  let fixture: ComponentFixture<PurchaseReportComponent>;
  let accReport: jasmine.SpyObj<any>;
  let loading: jasmine.SpyObj<LoadingService>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    accReport = jasmine.createSpyObj('OiAccountReportService', [...new Set(EXPORTS.map(([, m]) => m))]);
    loading = jasmine.createSpyObj('LoadingService', ['startLoad', 'endLoad']);
    toast = jasmine.createSpyObj('ToastService', ['success', 'danger']);

    await TestBed.configureTestingModule({
      imports: [PurchaseReportComponent],
      providers: [
        { provide: OiAccountReportService, useValue: accReport },
        { provide: SupplierReportService, useValue: { displayYear: [] } },
        { provide: LoadingService, useValue: loading },
        { provide: ToastService, useValue: toast },
      ],
    })
      // the export methods are what's under test; the template's child report
      // components would drag in their own services
      .overrideComponent(PurchaseReportComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(PurchaseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  for (const [method, apiMethod] of EXPORTS) {
    describe(method, () => {
      const run = () => (component[method] as (compType: number) => void)(1);

      it('ends loading and shows the error when the request fails', () => {
        accReport[apiMethod].and.returnValue(throwError(() => new Error('boom')));

        run();

        expect(loading.startLoad).toHaveBeenCalledTimes(1);
        expect(toast.danger).toHaveBeenCalledWith('boom');
        expect(loading.endLoad).toHaveBeenCalledTimes(1);
      });

      it('ends loading when the request succeeds', () => {
        (component as any).toXlsx = jasmine.createSpy('toXlsx').and.resolveTo();
        accReport[apiMethod].and.returnValue(of([]));

        run();

        expect((component as any).toXlsx).toHaveBeenCalled();
        expect(loading.endLoad).toHaveBeenCalledTimes(1);
      });

      it('keeps loading on until the request settles', () => {
        const response$ = new Subject<unknown[]>();
        accReport[apiMethod].and.returnValue(response$);

        run();
        expect(loading.endLoad).not.toHaveBeenCalled();

        response$.error(new Error('timeout'));
        expect(loading.endLoad).toHaveBeenCalledTimes(1);
      });
    });
  }
});
