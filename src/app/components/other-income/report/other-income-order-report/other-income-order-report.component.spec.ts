import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { OtherIncomeOrderReportComponent } from './other-income-order-report.component';
import { ApiService } from '../../../../service/api/api.service';
import { LoadingService } from '../../../../service/loading/loading.service';

describe('OtherIncomeOrderReportComponent', () => {
  let component: OtherIncomeOrderReportComponent;
  let fixture: ComponentFixture<OtherIncomeOrderReportComponent>;
  let api: jasmine.SpyObj<ApiService>;
  let loading: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ApiService', ['get']);
    loading = jasmine.createSpyObj('LoadingService', ['startLoad', 'endLoad']);

    await TestBed.configureTestingModule({
      imports: [OtherIncomeOrderReportComponent],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: LoadingService, useValue: loading },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OtherIncomeOrderReportComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('year', 2026);
    fixture.detectChanges();
  });

  it('ends loading when the report request fails', () => {
    api.get.and.returnValue(throwError(() => new Error('500')));

    component.fetchDN();

    expect(loading.startLoad).toHaveBeenCalledTimes(1);
    expect(loading.endLoad).toHaveBeenCalledTimes(1);
    expect(component.cannotExport()).toBeTrue();
  });

  it('still fetches after a previous request failed', () => {
    api.get.and.returnValue(throwError(() => new Error('500')));
    component.fetchDN();

    api.get.and.returnValue(of([]));
    api.get.calls.reset();
    loading.endLoad.calls.reset();
    component.fetchHU();

    expect(api.get).toHaveBeenCalledWith(jasmine.stringContaining('/hu/with-po'), jasmine.anything());
    expect(loading.endLoad).toHaveBeenCalled();
  });

  it('does not end loading when switchMap cancels a superseded request', () => {
    const requests: Subject<any>[] = [];
    api.get.and.callFake((() => {
      const s = new Subject<any>();
      requests.push(s);
      return s;
    }) as any);

    component.fetchDN();
    requests[0].next([]);
    loading.endLoad.calls.reset();

    // year$ then compType$ each re-emit combineLatest: the first request is
    // cancelled by the second
    component.fetchHU();
    expect(requests.length).toBe(3);
    expect(loading.endLoad).not.toHaveBeenCalled();

    requests[2].next([]);
    expect(loading.endLoad).toHaveBeenCalledTimes(1);
  });
});
