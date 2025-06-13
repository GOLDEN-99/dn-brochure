import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutDetailComponent } from './in-out-detail.component';

describe('InOutDetailComponent', () => {
  let component: InOutDetailComponent;
  let fixture: ComponentFixture<InOutDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InOutDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
