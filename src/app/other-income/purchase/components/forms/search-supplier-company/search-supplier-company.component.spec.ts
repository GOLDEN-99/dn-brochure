import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSupplierCompanyComponent } from './search-supplier-company.component';

describe('SearchSupplierCompanyComponent', () => {
  let component: SearchSupplierCompanyComponent;
  let fixture: ComponentFixture<SearchSupplierCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchSupplierCompanyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchSupplierCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
