import { Component, model } from '@angular/core';
import { form, FormField, schema, min, validate } from '@angular/forms/signals';

@Component({
  selector: 'app-promotion-condition',
  imports: [FormField],
  templateUrl: './promotion-condition.component.html',
  styleUrl: './promotion-condition.component.scss',
})
export class PromotionConditionComponent {
  condition = model<TCondition>({
    field: 'SUBTOTAL',
    op: 'GTE',
    value: 1
  })

  conditionForm = form(this.condition, schema((path) => {
    validate(path, (ctx) => {
      const f = ctx.valueOf(path.field)
      if (['SUBTOTAL', 'COUNT'].includes(f)) return null
      return {
        kind: 'Invalid condition type',
        message: 'condition field must be SUBTOTAL | COUNT'
      }
    })
    min(path.value, 0)
  }))
}

type TCondition = {
  field: string
  op: string
  value: number
}
