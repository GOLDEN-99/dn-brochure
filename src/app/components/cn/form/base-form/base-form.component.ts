import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ICnForm, TBank } from '../../../../types/cn.type';
import { TMapForm } from '../../../../types';
import { TransferFormComponent } from "../transfer-form/transfer-form.component";
import { tap } from 'rxjs';
import { FormService } from '../../../../service/form/form.service';
import { BankDropdownComponent } from "../../dropdown/bank-dropdown/bank-dropdown.component";

@Component({
  selector: 'app-base-form',
  imports: [ReactiveFormsModule, TransferFormComponent, BankDropdownComponent],
  templateUrl: './base-form.component.html',
  styleUrl: './base-form.component.scss'
})
export class BaseFormComponent implements OnInit {

  ngOnInit(): void {
    this.cnForm.valueChanges.subscribe(console.log)
  }

  private formServ = inject(FormService)
  private fb = inject(FormBuilder)

  isTransfer = this.formServ.isTransfer
  cnForm = this.formServ.baseForm
  reasonOpt = this.formServ.possibleReason
  resultOpt = this.formServ.possibleResult

}
