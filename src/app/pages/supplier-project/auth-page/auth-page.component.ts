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
export class AuthPageComponent extends BaseSupplierForm {
  readonly = input(false)
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


}

