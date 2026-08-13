import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SupplierLayoutComponent } from './supplier-layout.component';
import { IbobCompService } from '../../service/supplier/ibob-comp.service';

describe('SupplierLayoutComponent', () => {
  let component: SupplierLayoutComponent;
  let fixture: ComponentFixture<SupplierLayoutComponent>;
  let compServ: jasmine.SpyObj<IbobCompService>;

  beforeEach(async () => {
    compServ = jasmine.createSpyObj<IbobCompService>('IbobCompService', ['setCompType']);

    // ngOnInit reads route.pathFromRoot[1] and maps url segment [1].path, i.e. it assumes the
    // layout is mounted at least two levels deep (see inbound.route.ts: 'inbound/:compType').
    // provideRouter([]) alone gives a single root route, so pathFromRoot[1] is undefined and
    // the component throws on .pipe. This mock reproduces the real nesting.
    const activatedRoute = {
      pathFromRoot: [
        { url: of([]) },
        { url: of([{ path: 'inbound' }, { path: 'DN' }]) },
      ],
    };

    await TestBed.configureTestingModule({
      imports: [SupplierLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: IbobCompService, useValue: compServ },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets the company type from the second url segment', () => {
    expect(compServ.setCompType).toHaveBeenCalledWith('DN');
  });
});
