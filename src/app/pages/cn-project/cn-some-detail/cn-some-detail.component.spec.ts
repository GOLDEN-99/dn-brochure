import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnSomeDetailComponent } from './cn-some-detail.component';

describe('CnSomeDetailComponent', () => {
  let component: CnSomeDetailComponent;
  let fixture: ComponentFixture<CnSomeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnSomeDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnSomeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
