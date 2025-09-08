import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../../service/other-income/event.service';

@Component({
  selector: 'app-event-select',
  imports: [FormsModule],
  template: `<div class="app-form-select">
  <label for="event-select">กิจกรรม</label>
  <select
    name="event-select"
    id="event-select"
    [ngModel]="eventId()"
    (ngModelChange)="onSelect($event)"
  >
    <option [ngValue]="0" disabled>กรุณาเลือก</option>
    @for (item of renderList(); track item.id) {
      <option [ngValue]="item.id" >{{item.eventName}}</option>
    }
  </select>
</div>`,
  styles: ``
})
export class EventSelectComponent {
  eventId = input(0)
  eventIdChange = output<number>()
  isLightChange = output<number>()
  onSelect = (eventId: number) => {
    const event = this.renderList().find(r => r.id === eventId)
    if (!event) return
    this.eventIdChange.emit(event.id);
    this.isLightChange.emit(event.eventType);
  }
  private eventService = inject(EventService)
  private items = this.eventService.event
  filter = input<TFilter>('all')
  renderList = computed(() => {
    const filter = this.filter()
    const all = this.items()
    switch (filter) {
      case 'light': return all.filter(({ eventType }) => eventType === 2)
      case 'not-light': return all.filter(({ eventType }) => eventType !== 2)
      case 'all': return all
    }
  })
}

type TFilter = 'light' | 'not-light' | 'all'