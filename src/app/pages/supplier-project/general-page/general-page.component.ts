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
export class GeneralPageComponent extends BaseSupplierForm {
  readonly = input(false)
  addContact = this.formService.addEmpl
  removeContact = this.formService.removeEmpl
  updateEmpl = this.formService.updateEmpl
  updateEmplName = this.updateEmpl('emplName')
  updateEmplPhone = this.updateEmpl('emplPhone')
  updateEmplEmail = this.updateEmpl('emplEmail')
  updator = this.formService.updator

}


type TInitialValue = Pick<TDNComp, 'compName' | 'compName2' | 'compAddr' | 'compPhone' | 'compEmail' | 'compFax'> & { saleName?: string }