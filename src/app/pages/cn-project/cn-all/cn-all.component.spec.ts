import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnAllComponent } from './cn-all.component';

describe('CnAllComponent', () => {
  let component: CnAllComponent;
  let fixture: ComponentFixture<CnAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
