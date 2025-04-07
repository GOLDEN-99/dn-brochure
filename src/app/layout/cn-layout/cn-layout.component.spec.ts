import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnLayoutComponent } from './cn-layout.component';

describe('CnLayoutComponent', () => {
  let component: CnLayoutComponent;
  let fixture: ComponentFixture<CnLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
