import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { InvoiceStateWorklistPageComponent } from './invoice-state-worklist-page.component';
import { OtherIncomeAccountApiService } from '../../services/other-income-account-api.service';
import { TInvoiceStateRow } from '../../../shared/types/other-income.type';
import { XLSXReportService } from '../../../../service/xlsx-report/xlsx-report.service';
import type * as XLSXType from 'xlsx';

describe('InvoiceStateWorklistPageComponent', () => {
  let component: InvoiceStateWorklistPageComponent;
  let fixture: ComponentFixture<InvoiceStateWorklistPageComponent>;
  let api: jasmine.SpyObj<OtherIncomeAccountApiService>;
  let router: jasmine.SpyObj<Router>;
  let xlsx: jasmine.SpyObj<XLSXReportService>;
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const row = (over: Partial<TInvoiceStateRow> = {}): TInvoiceStateRow => ({
    invoiceId: 510,
    settlementId: 681,
    contractId: 420,
    contractType: 'PROMO',
    compCode: '640',
    compType: 'DN',
    compName: 'Montana Marketing Co.,Ltd (MULTILINE 2)',
    contractLabelName: 'อบรมสินค้า Training',
    incomeLabelName: 'จ่ายเป็นเช็ค',
    invoiceNumb: 'ARI602000006',
    invoiceDate: '2026-02-11',
    invoiceAmount: 10000,
    matchedAmount: 0,
    invoiceState: 'UNMATCHED',
    receiptNumbs: null,
    lastReceiptDate: null,
    ...over,
  });

  /** Cell text of the first body row, trimmed, in column order. */
  const bodyCells = (): string[] =>
    Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr:first-child td') as NodeListOf<HTMLElement>
    ).map(td => td.textContent?.trim() ?? '');

  const headers = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('thead th') as NodeListOf<HTMLElement>).map(
      th => th.textContent?.trim() ?? ''
    );

  const setQueryParams = (params: Record<string, string>) =>
    queryParamMap$.next(convertToParamMap(params));

  beforeEach(async () => {
    queryParamMap$ = new BehaviorSubject(convertToParamMap({}));

    api = jasmine.createSpyObj('OtherIncomeAccountApiService', ['getInvoiceStates']);
    api.getInvoiceStates.and.returnValue(of([row()]));

    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl', 'createUrlTree', 'serializeUrl']);
    router.createUrlTree.and.returnValue({} as never);
    router.serializeUrl.and.returnValue('');

    xlsx = jasmine.createSpyObj('XLSXReportService', ['convertJsonToWorkbook', 'exportWorkbook']);

    await TestBed.configureTestingModule({
      imports: [InvoiceStateWorklistPageComponent],
      providers: [
        { provide: OtherIncomeAccountApiService, useValue: api },
        { provide: Router, useValue: router },
        { provide: XLSXReportService, useValue: xlsx },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap$.asObservable(),
            get snapshot() {
              return { queryParamMap: queryParamMap$.value };
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceStateWorklistPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads rows on init with the default DN comp type', () => {
    expect(component.items().length).toBe(1);
    expect(api.getInvoiceStates).toHaveBeenCalledWith({
      contractType: undefined,
      invoiceState: undefined,
      compType: 'DN',
    });
  });

  describe('invoiceDate', () => {
    it('renders invoiceDate as dd/MM/yyyy in its own column', () => {
      const index = headers().indexOf('วันที่ใบแจ้งหนี้');

      expect(index).toBeGreaterThan(-1);
      expect(bodyCells()[index]).toBe('11/02/2026');
    });

    it('renders a dash when invoiceDate is null', () => {
      api.getInvoiceStates.and.returnValue(of([row({ invoiceDate: null })]));
      component.refresh();
      fixture.detectChanges();

      expect(bodyCells()[headers().indexOf('วันที่ใบแจ้งหนี้')]).toBe('-');
    });

    it('keeps invoiceDate distinct from the last receipt date column', () => {
      api.getInvoiceStates.and.returnValue(
        of([row({ invoiceDate: '2026-02-11', lastReceiptDate: '2026-03-20' })])
      );
      component.refresh();
      fixture.detectChanges();

      const cells = bodyCells();
      const cols = headers();

      expect(cells[cols.indexOf('วันที่ใบแจ้งหนี้')]).toBe('11/02/2026');
      expect(cells[cols.indexOf('วันที่ใบเสร็จรับเงินล่าสุด')]).toBe('20/03/2026');
    });

    it('exports invoiceDate in a column positioned after the invoice number', () => {
      const rows = [row()];
      component.items.set(rows);
      xlsx.convertJsonToWorkbook.and.returnValue(() => of({} as XLSXType.WorkBook));
      xlsx.exportWorkbook.and.returnValue(() => of(undefined));

      component.exportExcel();

      const { config } = xlsx.convertJsonToWorkbook.calls.mostRecent().args[0];
      const headerNames = config.map(c => c.header);
      const dateColumn = config[headerNames.indexOf('วันที่ใบแจ้งหนี้')];

      expect(headerNames.indexOf('วันที่ใบแจ้งหนี้')).toBe(headerNames.indexOf('เลขที่ใบแจ้งหนี้') + 1);
      expect(dateColumn.valueMapper(rows[0])).toBe('2026-02-11');
      expect(dateColumn.valueMapper(row({ invoiceDate: null }))).toBe('');
    });
  });

  describe('filters', () => {
    it('re-fetches with filters parsed from the query params', () => {
      setQueryParams({ contractType: 'PROMO', invoiceState: 'MATCHED', compType: 'HU' });

      expect(api.getInvoiceStates).toHaveBeenCalledWith({
        contractType: 'PROMO',
        invoiceState: 'MATCHED',
        compType: 'HU',
      });
    });

    it('falls back to defaults when query params are invalid', () => {
      setQueryParams({ contractType: 'BOGUS', invoiceState: 'BOGUS', compType: 'BOGUS' });

      expect(component.filters()).toEqual({
        contractType: null,
        invoiceState: null,
        compType: 'DN',
      });
    });

    it('writes filter changes to the URL rather than to local state', () => {
      component.setContractType('BRANCH');

      const [, extras] = router.navigate.calls.mostRecent().args;
      expect(extras?.queryParams).toEqual({ contractType: 'BRANCH' });
      expect(extras?.queryParamsHandling).toBe('merge');
    });

    it('clears a filter to null when the empty option is chosen', () => {
      component.setContractType('');

      const [, extras] = router.navigate.calls.mostRecent().args;
      expect(extras?.queryParams).toEqual({ contractType: null });
    });
  });

  describe('error handling', () => {
    it('shows an error message and keeps loading false when the fetch fails', () => {
      api.getInvoiceStates.and.returnValue(throwError(() => new Error('boom')));
      component.refresh();

      expect(component.error()).toBe('โหลดข้อมูลไม่สำเร็จ');
      expect(component.loading()).toBe(false);
    });

    it('recovers on a later successful refresh', () => {
      api.getInvoiceStates.and.returnValue(throwError(() => new Error('boom')));
      component.refresh();

      api.getInvoiceStates.and.returnValue(of([row()]));
      component.refresh();

      expect(component.error()).toBeNull();
      expect(component.items().length).toBe(1);
    });
  });

  describe('isPartiallyReceived', () => {
    it('is true for an unmatched invoice with a partial match', () => {
      expect(component.isPartiallyReceived(row({ matchedAmount: 4000 }))).toBe(true);
    });

    it('is false when nothing has been matched', () => {
      expect(component.isPartiallyReceived(row({ matchedAmount: 0 }))).toBe(false);
    });

    it('is false once the invoice is fully matched', () => {
      expect(
        component.isPartiallyReceived(row({ invoiceState: 'MATCHED', matchedAmount: 10000 }))
      ).toBe(false);
    });
  });
});
