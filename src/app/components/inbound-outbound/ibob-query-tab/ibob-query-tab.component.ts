import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CUSTOM_FIELD_SEARCH_TOKEN } from './ibob-query-tab-token';

@Component({
  selector: 'app-ibob-query-tab',
  imports: [FormsModule],
  templateUrl: './ibob-query-tab.component.html',
  styles: ``
})
export class IbobQueryTabComponent {
  private optionToken = inject(CUSTOM_FIELD_SEARCH_TOKEN)
  private optionRefMap = this.optionToken.opt
  private optionRefList = [...this.optionRefMap.entries()].map(([id, { label }]) => ({ id, label }))
  selectOption = signal(this.optionRefList)

  currentOption = signal(0)
  term = signal('')
  id = computed(() => `search-input-opt-${this.currentOption()}`)

  onCurrentOptionChange = (s: number) => {
    this.currentOption.update(() => s);
    this.term.update(() => '')
  }

  currentData = computed(() => this.optionRefMap.get(this.currentOption()))
  inputId = computed(() => `text-opt-${this.currentOption()}`)
  fieldName = computed(() => {
    const temp = this.currentData()
    return temp?.field ?? ''
  })
  labelText = computed(() => {
    const temp = this.currentData()
    return temp?.label ?? ''
  })

  search = output<{ field: string, term: string }>()

  onClick = () => {
    const field = this.fieldName()
    if (!field) return
    const term = this.term()
    this.search.emit({ field, term })
  }

  disable = computed(() => this.currentOption() === 0 || this.term() === '')

}
