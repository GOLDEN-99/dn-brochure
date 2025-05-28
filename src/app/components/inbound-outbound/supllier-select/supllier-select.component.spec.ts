import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupllierSelectComponent } from './supllier-select.component';

describe('SupllierSelectComponent', () => {
  let component: SupllierSelectComponent;
  let fixture: ComponentFixture<SupllierSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupllierSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupllierSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
