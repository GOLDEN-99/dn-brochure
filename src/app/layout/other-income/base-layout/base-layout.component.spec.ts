import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BaseLayoutComponent, LABEL_TOKEN } from './base-layout.component';

describe('BaseLayoutComponent', () => {
  let component: BaseLayoutComponent;
  let fixture: ComponentFixture<BaseLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseLayoutComponent],
      // LABEL_TOKEN is supplied by route providers in other-income.route.ts; the label is
      // whatever the route sets, so the test picks its own and asserts it is rendered.
      providers: [
        provideRouter([]),
        { provide: LABEL_TOKEN, useValue: { label: 'รายได้อื่นๆ light box' } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the label from LABEL_TOKEN as the page heading', () => {
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1.textContent).toContain('รายได้อื่นๆ light box');
  });
});
