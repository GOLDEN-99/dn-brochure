import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProchurePageComponent } from './prochure-page.component';

describe('ProchurePageComponent', () => {
  let component: ProchurePageComponent;
  let fixture: ComponentFixture<ProchurePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProchurePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProchurePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
