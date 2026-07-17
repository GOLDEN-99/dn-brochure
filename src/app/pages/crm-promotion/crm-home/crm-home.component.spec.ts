import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmHomeComponent } from './crm-home.component';

describe('CrmHomeComponent', () => {
  let component: CrmHomeComponent;
  let fixture: ComponentFixture<CrmHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
