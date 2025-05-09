import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutListComponent } from './in-out-list.component';

describe('InOutListComponent', () => {
  let component: InOutListComponent;
  let fixture: ComponentFixture<InOutListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InOutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
