import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnStateService } from '../../shared/services/cn-state.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CnFailComponent } from './cn-fail.component';

describe('CnFailComponent', () => {
  let component: CnFailComponent;
  let fixture: ComponentFixture<CnFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnFailComponent],
      providers: [CnStateService, provideHttpClient(), provideHttpClientTesting()]
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
