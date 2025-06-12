import { Component, computed, inject } from '@angular/core';
import { OtherIncomeSpecFormService } from '../../../../service/other-income/other-income-spec-form.service';
import { FormsModule } from '@angular/forms';
import { DiscountSubformComponent } from "../../../../components/other-income/form/discount-subform/discount-subform.component";
import { DateInputComponent } from "../../../../components/date-input/date-input.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-special-income-form',
  imports: [FormsModule, DiscountSubformComponent, DateInputComponent, RouterLink],
  templateUrl: './special-income-form.component.html',
  styleUrl: './special-income-form.component.scss'
})
export class SpecialIncomeFormComponent {
  private form = inject(OtherIncomeSpecFormService)
  formState = this.form.state
  update = this.form.updator



  // endPoint = computed(() => this.event() !== 0 ? '/other-income/purchase/create-1' : '/other-income/purchase')
  // endPointDisable = computed(() => this.invalidEvent() || this.invalidDiscountType() || this.invalidPeriod() ? 'btn btn-success disabled' : 'btn btn-success')

}
