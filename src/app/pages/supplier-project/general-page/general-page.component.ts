import { Component, input, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, Subject, takeUntil } from 'rxjs';
import { TMaybe } from '../../../types';
import { TDNComp, THUComp } from '../../../types/ibob-supplier.type';

@Component({
  selector: 'app-general-page',
  imports: [ReactiveFormsModule],
  templateUrl: './general-page.component.html',
  styleUrl: './general-page.component.scss'
})
export class GeneralPageComponent extends BaseSupplierForm implements OnInit, OnDestroy {
  initialValue = input<TMaybe<TInitialValue>>(null)
  init$ = toObservable(this.initialValue).pipe(filter(a => a !== null))
  stepTwoForm = this.formService.form.controls.general
  addContact = this.formService.addGeneralContacForm
  createFormItem = this.formService.createGeneralContactForm
  removeContact = this.formService.removeGenralContactForm

  ngOnInit(): void {
    this.init$.pipe(takeUntil(this.sub$)).subscribe({
      next: ({ compName, compName2, compAddr, compEmail, compFax, compPhone, saleName }) => {
        this.stepTwoForm.patchValue({ compName, compName2, compAddr, compFax, compEmail, compPhone })
        const contact = saleName?.split('|')
          .map(temp => temp.split('/'))
          .map(
            ([name, phone, mail]) => ({
              emplName: name ?? '',
              emplPhone: phone ?? '',
              emplEmail: mail ?? ''
            })
          )
          ?? []
        this.formService.setContactForm(contact)
      }
    })
  }

  ngOnDestroy(): void {
    this.unsub()
  }
}


type TInitialValue = Pick<TDNComp, 'compName' | 'compName2' | 'compAddr' | 'compPhone' | 'compEmail' | 'compFax'> & { saleName?: string }