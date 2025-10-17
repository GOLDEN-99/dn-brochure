import { Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { FormsModule } from '@angular/forms';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent extends BaseSupplierForm implements OnInit, OnDestroy {

  private supplierApiServ = inject(SupplierApiService)
  ngOnInit(): void {
    this.supplierApiServ.selectedCode$
      .pipe(
        tap(code => this.updateCompCode(code)),
        takeUntil(this.sub$)
      )
      .subscribe()
  }
  ngOnDestroy(): void {
    this.sub$.next()
    this.sub$.complete()
  }
  readonly = input(false)
  passwordType = signal<'text' | 'password'>('password')

  togglePassword = () => this.passwordType.update(prev => prev === 'password' ? 'text' : 'password')
  formData = this.formService.formState
  private updator = this.formService.updator
  updateUsername = this.updator('username')
  updatePassword = this.updator('userpass')
  updateCompCode = this.updator('compCode')
  //

}

