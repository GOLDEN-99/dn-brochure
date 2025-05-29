import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProchureCardComponent } from './prochure-card.component';

describe('ProchureCardComponent', () => {
  let component: ProchureCardComponent;
  let fixture: ComponentFixture<ProchureCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProchureCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProchureCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
