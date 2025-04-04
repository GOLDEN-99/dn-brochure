import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TransferFormComponent } from "../transfer-form/transfer-form.component";
import { FormService } from '../../../../service/form/form.service';
import { CnTypeFormComponent } from "../cn-type-form/cn-type-form.component"
import { ResultDropdownComponent } from "../result-dropdown/result-dropdown.component";
@Component({
  selector: 'app-base-form',
  imports: [ReactiveFormsModule, CnTypeFormComponent, TransferFormComponent, ResultDropdownComponent],
  templateUrl: './base-form.component.html',
  styleUrl: './base-form.component.scss'
})
export class BaseFormComponent implements OnInit {

  ngOnInit(): void {
    this.cnForm.valueChanges.subscribe(console.log)
  }

  private formServ = inject(FormService)

  isTransfer = this.formServ.isTransfer
  cnForm = this.formServ.baseForm
  bankOpt = this.formServ.possibleBank
  reasonOpt = this.formServ.possibleReason
  resultOpt = this.formServ.possibleResult
  notShow = this.formServ.notShowResult
}
