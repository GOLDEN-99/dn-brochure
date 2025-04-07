import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnSomeComponent } from './cn-some.component';

describe('CnSomeComponent', () => {
  let component: CnSomeComponent;
  let fixture: ComponentFixture<CnSomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnSomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnSomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
