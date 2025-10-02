import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IbobAdminAddComponent } from './ibob-admin-add.component';

describe('IbobAdminAddComponent', () => {
  let component: IbobAdminAddComponent;
  let fixture: ComponentFixture<IbobAdminAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IbobAdminAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IbobAdminAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
