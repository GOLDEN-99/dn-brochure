import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProchureComponent } from './prochure.component';

describe('ProchureComponent', () => {
  let component: ProchureComponent;
  let fixture: ComponentFixture<ProchureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProchureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProchureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
