import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { BaseBrochureComponent } from './base-brochure.component';
import { BROCHURE_PRICE_TYPE_TOKEN, BROCHURE_TOKEN } from '../../../lib';

describe('BaseBrochureComponent', () => {
  let component: BaseBrochureComponent;
  let fixture: ComponentFixture<BaseBrochureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseBrochureComponent],
      // NOTE: unlike the other token-injecting components, BROCHURE_TOKEN and
      // BROCHURE_PRICE_TYPE_TOKEN are provided nowhere in the application -- no route and no
      // parent component supplies them, and nothing references BaseBrochureComponent either.
      // The stubs below are the test's own, not a mirror of real wiring. See the commit
      // message: this component looks like dead code and is a candidate for deletion.
      providers: [
        provideRouter([]),
        {
          provide: BROCHURE_TOKEN,
          useValue: {
            head: signal(null),
            content: signal([]),
            maxItem: signal(12 as const),
            totalPage: signal([]),
            color: signal('green' as const),
          },
        },
        { provide: BROCHURE_PRICE_TYPE_TOKEN, useValue: { priceType: 'price' } },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseBrochureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
