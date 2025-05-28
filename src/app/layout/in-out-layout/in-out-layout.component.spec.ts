import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutLayoutComponent } from './in-out-layout.component';

describe('InOutLayoutComponent', () => {
  let component: InOutLayoutComponent;
  let fixture: ComponentFixture<InOutLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InOutLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
