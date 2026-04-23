import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-promotion-set-config',
  imports: [FormsModule, RouterLink],
  templateUrl: './create-promotion-set-config.component.html',
  styleUrl: './create-promotion-set-config.component.scss'
})
export class CreatePromotionSetConfigComponent {
  private readonly result = signal<{ id: number; name: string }[]>([])
  disabled = signal(false)
  searchTerm = signal('')
  renderGroup = computed(() => this.result())
  canNotAdd = computed(() => this.searchTerm() === "" || this.renderGroup().length !== 0 || this.disabled())
  onCreate() { }
  onDelete(id: number) { }
}
