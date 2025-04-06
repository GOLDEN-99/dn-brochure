import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemarkSelectComponent } from './remark-select.component';

describe('RemarkSelectComponent', () => {
  let component: RemarkSelectComponent;
  let fixture: ComponentFixture<RemarkSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemarkSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemarkSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
