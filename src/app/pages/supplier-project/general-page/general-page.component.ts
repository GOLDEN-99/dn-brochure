import { Component, input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, Subject, takeUntil } from 'rxjs';
import { TMaybe } from '../../../types';
import { TDNComp, THUComp } from '../../../types/ibob-supplier.type';

@Component({
  selector: 'app-general-page',
  imports: [FormsModule],
  templateUrl: './general-page.component.html',
  styleUrl: './general-page.component.scss'
})
export class GeneralPageComponent extends BaseSupplierForm implements OnInit, OnDestroy {
  initialValue = input<TMaybe<TInitialValue>>(null)
  init$ = toObservable(this.initialValue).pipe(filter(a => a !== null))
  addContact = this.formService.addEmpl
  removeContact = this.formService.removeEmpl
  updateEmpl = this.formService.updateEmpl
  updateEmplName = this.updateEmpl('emplName')
  updateEmplPhone = this.updateEmpl('emplPhone')
  updateEmplEmail = this.updateEmpl('emplEmail')

  formState = this.formService.formState
  emplList = this.formService.emplList
  updator = this.formService.updator

  ngOnInit(): void {
    this.init$.pipe(takeUntil(this.sub$)).subscribe({
      next: ({ compName, compName2, compAddr, compEmail, compFax, compPhone, saleName }) => {
        this.formState.update(prev => ({ ...prev, compName, compName2, compAddr, compEmail, compFax, compPhone }))
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
        this.emplList.set(contact)
      }
    })
  }

  ngOnDestroy(): void {
    this.unsub()
  }
}


type TInitialValue = Pick<TDNComp, 'compName' | 'compName2' | 'compAddr' | 'compPhone' | 'compEmail' | 'compFax'> & { saleName?: string }