import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { ReactiveFormsModule } from '@angular/forms';
import { TReturnForm } from '../../../service/supplier/supplier-form/supplier-from.service';

@Component({
  selector: 'app-condition-page',
  imports: [NgbNavModule, RouterLink, ReactiveFormsModule, RouterLink],
  templateUrl: './condition-page.component.html',
  styleUrl: './condition-page.component.scss'
})
export class ConditionPageComponent extends BaseSupplierForm {
  active = signal(1)

  form = this.formService.form.controls.condi

  addSup = this.formService.addCondi("sup")
  removeSup = this.formService.removeCondi("sup")

  addBranch = this.formService.addCondi("branch")
  removeBranch = this.formService.removeCondi("branch")

  get supForm(): TReturnForm | null {
    return this.form.get('sup') as any as TReturnForm;
  }
  get branchForm(): TReturnForm | null {
    return this.form.get('branch') as any as TReturnForm;
  }
}
