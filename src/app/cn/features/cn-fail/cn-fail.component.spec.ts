import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnFailComponent } from './cn-fail.component';

describe('CnFailComponent', () => {
  let component: CnFailComponent;
  let fixture: ComponentFixture<CnFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnFailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
