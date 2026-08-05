import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type * as XLSXType from 'xlsx';

import { BillDiscountStateWorklistPageComponent } from './bill-discount-state-worklist-page.component';
import { OtherIncomeAccountApiService } from '../../services/other-income-account-api.service';
import { TBillDiscountStateRow } from '../../../shared/types/other-income.type';
import { XLSXReportService } from '../../../../service/xlsx-report/xlsx-report.service';

describe('BillDiscountStateWorklistPageComponent', () => {
  let component: BillDiscountStateWorklistPageComponent;
  let fixture: ComponentFixture<BillDiscountStateWorklistPageComponent>;
  let api: jasmine.SpyObj<OtherIncomeAccountApiService>;
  let router: jasmine.SpyObj<Router>;
  let xlsx: jasmine.SpyObj<XLSXReportService>;
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const row = (over: Partial<TBillDiscountStateRow> = {}): TBillDiscountStateRow => ({
    billDiscountId: 1,
    settlementId: 172,
    contractId: 87,
    contractType: 'PROMO',
    compCode: '34',
    compType: 'DN',
    compName: 'Bangkokdrug Co.,Ltd.(Ya)',
    contractLabelName: 'อื่นๆ',
    incomeLabelName: 'CN มากับบิล',
    orderNumb: '058047',
    orderDate: '2026-01-20T00:00:00',
    receNumb: 'RC066927',
    receDate: '2026-01-22T00:00:00',
    subtotalAmount: 8710,
    checkState: 'UNCHECKED',
    checkedAt: null,
    checkedBy: null,
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

  const cellUnder = (header: string): string => bodyCells()[headers().indexOf(header)];

  const setQueryParams = (params: Record<string, string>) =>
    queryParamMap$.next(convertToParamMap(params));

  beforeEach(async () => {
    queryParamMap$ = new BehaviorSubject(convertToParamMap({}));

    api = jasmine.createSpyObj('OtherIncomeAccountApiService', [
      'getBillDiscountStates',
      'checkBillDiscount',
      'deleteBillDiscountState',
    ]);
    api.getBillDiscountStates.and.returnValue(of([row()]));
    api.checkBillDiscount.and.returnValue(of(undefined));
    api.deleteBillDiscountState.and.returnValue(of(undefined));

    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl', 'createUrlTree', 'serializeUrl']);
    router.createUrlTree.and.returnValue({} as never);
    router.serializeUrl.and.returnValue('');

    xlsx = jasmine.createSpyObj('XLSXReportService', ['convertJsonToWorkbook', 'exportWorkbook']);

    await TestBed.configureTestingModule({
      imports: [BillDiscountStateWorklistPageComponent],
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

    fixture = TestBed.createComponent(BillDiscountStateWorklistPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads rows on init with the default DN comp type', () => {
    expect(component.items().length).toBe(1);
    expect(api.getBillDiscountStates).toHaveBeenCalledWith({
      contractType: undefined,
      checkState: undefined,
      compType: 'DN',
    });
  });

  describe('PO / RC columns', () => {
    it('labels the order columns as PO and the receipt columns as RC', () => {
      const cols = headers();

      expect(cols).toContain('เลขที่ PO');
      expect(cols).toContain('วันที่ PO');
      expect(cols).toContain('เลขที่ RC');
      expect(cols).toContain('วันที่รับเข้า');
    });

    it('renders orderNumb and orderDate under the PO columns', () => {
      expect(cellUnder('เลขที่ PO')).toBe('058047');
      expect(cellUnder('วันที่ PO')).toBe('20/01/2026');
    });

    it('renders receNumb and receDate under the RC columns', () => {
      expect(cellUnder('เลขที่ RC')).toBe('RC066927');
      expect(cellUnder('วันที่รับเข้า')).toBe('22/01/2026');
    });

    it('keeps each date next to the document number it belongs to', () => {
      const cols = headers();

      expect(cols.indexOf('วันที่ PO')).toBe(cols.indexOf('เลขที่ PO') + 1);
      expect(cols.indexOf('วันที่รับเข้า')).toBe(cols.indexOf('เลขที่ RC') + 1);
    });

    it('renders a dash when either date is null', () => {
      api.getBillDiscountStates.and.returnValue(of([row({ orderDate: null, receDate: null })]));
      component.refresh();
      fixture.detectChanges();

      expect(cellUnder('วันที่ PO')).toBe('-');
      expect(cellUnder('วันที่รับเข้า')).toBe('-');
    });

    it('exports both dates alongside their document numbers', () => {
      const rows = [row()];
      component.items.set(rows);
      xlsx.convertJsonToWorkbook.and.returnValue(() => of({} as XLSXType.WorkBook));
      xlsx.exportWorkbook.and.returnValue(() => of(undefined));

      component.exportExcel();

      const { config } = xlsx.convertJsonToWorkbook.calls.mostRecent().args[0];
      const names = config.map(c => c.header);
      const valueOf = (header: string, r: TBillDiscountStateRow) =>
        config[names.indexOf(header)].valueMapper(r);

      expect(names.indexOf('วันที่ PO')).toBe(names.indexOf('เลขที่ PO') + 1);
      expect(names.indexOf('วันที่รับเข้า')).toBe(names.indexOf('เลขที่ RC') + 1);
      expect(valueOf('วันที่ PO', rows[0])).toBe('2026-01-20T00:00:00');
      expect(valueOf('วันที่รับเข้า', rows[0])).toBe('2026-01-22T00:00:00');
      expect(valueOf('วันที่ PO', row({ orderDate: null }))).toBe('');
      expect(valueOf('วันที่รับเข้า', row({ receDate: null }))).toBe('');
    });
  });

  describe('filters', () => {
    it('re-fetches with filters parsed from the query params', () => {
      setQueryParams({ contractType: 'PROMO', checkState: 'CHECKED', compType: 'HU' });

      expect(api.getBillDiscountStates).toHaveBeenCalledWith({
        contractType: 'PROMO',
        checkState: 'CHECKED',
        compType: 'HU',
      });
    });

    it('falls back to defaults when query params are invalid', () => {
      setQueryParams({ contractType: 'BOGUS', checkState: 'BOGUS', compType: 'BOGUS' });

      expect(component.filters()).toEqual({
        contractType: null,
        checkState: null,
        compType: 'DN',
      });
    });

    it('writes filter changes to the URL rather than to local state', () => {
      component.setCheckState('CHECKED');

      const [, extras] = router.navigate.calls.mostRecent().args;
      expect(extras?.queryParams).toEqual({ checkState: 'CHECKED' });
      expect(extras?.queryParamsHandling).toBe('merge');
    });
  });

  describe('check', () => {
    it('marks a row checked and reloads the list', () => {
      api.getBillDiscountStates.calls.reset();

      component.check(row());

      expect(api.checkBillDiscount).toHaveBeenCalledWith(172, 1, 'account_user');
      expect(api.getBillDiscountStates).toHaveBeenCalled();
      expect(component.checkingId()).toBeNull();
    });

    it('surfaces an error and clears the pending id when the check fails', () => {
      api.checkBillDiscount.and.returnValue(throwError(() => new Error('boom')));

      component.check(row());

      expect(component.error()).toBe('ตรวจสอบไม่สำเร็จ');
      expect(component.checkingId()).toBeNull();
    });
  });

  describe('remove', () => {
    it('deletes a row and reloads the list', () => {
      api.getBillDiscountStates.calls.reset();

      component.remove(row());

      expect(api.deleteBillDiscountState).toHaveBeenCalledWith(172, 1);
      expect(api.getBillDiscountStates).toHaveBeenCalled();
    });

    it('surfaces an error when the delete fails', () => {
      api.deleteBillDiscountState.and.returnValue(throwError(() => new Error('boom')));

      component.remove(row());

      expect(component.error()).toBe('ลบไม่สำเร็จ');
    });
  });

  describe('error handling', () => {
    it('shows an error message and keeps loading false when the fetch fails', () => {
      api.getBillDiscountStates.and.returnValue(throwError(() => new Error('boom')));
      component.refresh();

      expect(component.error()).toBe('โหลดข้อมูลไม่สำเร็จ');
      expect(component.loading()).toBe(false);
    });

    it('recovers on a later successful refresh', () => {
      api.getBillDiscountStates.and.returnValue(throwError(() => new Error('boom')));
      component.refresh();

      api.getBillDiscountStates.and.returnValue(of([row()]));
      component.refresh();

      expect(component.error()).toBeNull();
      expect(component.items().length).toBe(1);
    });
  });
});
