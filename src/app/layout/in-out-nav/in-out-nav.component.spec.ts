import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutNavComponent } from './in-out-nav.component';

describe('InOutNavComponent', () => {
  let component: InOutNavComponent;
  let fixture: ComponentFixture<InOutNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InOutNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
