import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { FormsModule } from '@angular/forms';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { TAuthFormState } from '../../../types/ibob-supplier.type';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, distinctUntilChanged, map, Observable, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent extends BaseSupplierForm implements OnInit, OnDestroy {
  stepOneForm = this.formService.form.controls.auth
  patchForm = this.formService.patchAuth
  disable = () => this.stepOneForm.invalid || !this.stepOneForm.touched
  passwordType = signal<'text' | 'password'>('password')

  togglePassword = () => this.passwordType.update(prev => prev === 'password' ? 'text' : 'password')
  formData = this.formService.formState
  private updator = this.formService.updator
  updateUsername = this.updator('username')
  updatePassword = this.updator('userpass')
  updateCompCode = this.updator('compCode')
  //
  private supplierApiServ = inject(SupplierApiService)
  compCode = this.supplierApiServ.selectedCode
  compCode$ = toObservable(this.compCode)

  initialValue = input<TAuthFormState | null>(null)
  private initialValue$ = toObservable(this.initialValue)
  private merge$: Observable<Partial<TAuthFormState>> = combineLatest(
    [this.compCode$, this.initialValue$]
  ).pipe(
    map(([compCode, init]) => init === null ? ({ compCode }) : init)
  )
  private comparedFn = (prev: Partial<TAuthFormState>, cur: Partial<TAuthFormState>) =>
    prev?.username === cur?.username
    && prev?.userpass === cur?.userpass
    && prev?.compCode === cur?.compCode

  ngOnInit(): void {
    this.merge$
      .pipe(
        distinctUntilChanged(this.comparedFn),
        takeUntil(this.sub$)
      ).subscribe(
        (init) => this.formData.update(prev => ({ ...prev, ...init }))
      )
  }
  ngOnDestroy(): void {
    this.unsub()
  }
}

