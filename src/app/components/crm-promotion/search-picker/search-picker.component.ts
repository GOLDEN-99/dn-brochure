import { Component, ChangeDetectionStrategy, input, output, viewChild } from '@angular/core';
import { debounceTime, filter, map, merge, Observable, Subject } from 'rxjs';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

/**
 * Pick-to-add search box over an in-memory list.
 * - opens the list on focus / on click while closed (empty term shows everything, up to `limit`)
 * - clears itself after a pick and emits the picked item; the parent owns what "add" means
 */
@Component({
  selector: 'app-search-picker',
  imports: [NgbTypeahead],
  templateUrl: './search-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPickerComponent<T> {
  readonly inputId = input.required<string>()
  readonly label = input.required<string>()
  readonly placeholder = input('พิมพ์เพื่อค้นหา...')
  readonly disabled = input(false)
  readonly items = input.required<readonly T[]>()
  /** text matched against the typed term (case-insensitive substring) */
  readonly searchBy = input.required<(item: T) => string>()
  /** text shown in the result list */
  readonly format = input.required<(item: T) => string>()
  readonly limit = input<number | undefined>(undefined)
  /** ms; read once when the typeahead subscribes */
  readonly debounce = input(0)
  readonly picked = output<T>()

  private readonly typeahead = viewChild.required(NgbTypeahead)
  protected readonly focus$ = new Subject<string>()
  protected readonly click$ = new Subject<string>()

  // no distinctUntilChanged: the input is cleared programmatically after each
  // pick, so retyping the same text must still emit
  protected readonly search = (text$: Observable<string>) => {
    const ms = this.debounce()
    const typed$ = ms > 0 ? text$.pipe(debounceTime(ms)) : text$
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.typeahead().isPopupOpen()))
    return merge(typed$, this.focus$, clicksWithClosedPopup$).pipe(
      map(term => {
        const t = term.toLocaleLowerCase()
        const searchBy = this.searchBy()
        const matched = this.items().filter(item => searchBy(item).toLocaleLowerCase().includes(t))
        const limit = this.limit()
        return limit === undefined ? matched : matched.slice(0, limit)
      })
    )
  }

  protected onSelect(event: NgbTypeaheadSelectItemEvent<T>, input: HTMLInputElement) {
    // stop the typeahead from writing the picked item into the input, then clear it
    event.preventDefault()
    input.value = ''
    this.picked.emit(event.item)
  }
}
