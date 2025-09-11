import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { TCompAuth } from '../../../types/ibob-supplier.type';
import { toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent extends BaseSupplierForm implements OnInit, OnDestroy {
  stepOneForm = this.formService.form.controls.auth
  patchForm = this.formService.patchAuth
  disable = () => this.stepOneForm.invalid || !this.stepOneForm.touched
  passwordType = signal<'text' | 'password'>('password')

  togglePassword = () => this.passwordType.update(prev => prev === 'password' ? 'text' : 'password')

  private supplierApiServ = inject(SupplierApiService)

  compCode = this.supplierApiServ.selectedCode

  initialValue = input<TCompAuth | null>()
  private initialValue$ = toObservable(this.initialValue)
  private comparedFn = (prev: TCompAuth, cur: TCompAuth) => prev.username === cur.username && prev.userpass === cur.userpass
  ngOnInit(): void {
    this.initialValue$
      .pipe(
        filter(v => !!v),
        distinctUntilChanged(this.comparedFn),
        takeUntil(this.sub$)
      )
      .subscribe(this.patchForm)
  }
  ngOnDestroy(): void {
    this.unsub()
  }
}

type TInit = TCompAuth & { compCode: string }
