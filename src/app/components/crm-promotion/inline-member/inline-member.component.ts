import { Component, computed, inject, model, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TMember } from '../../../types/crm-promotion.type';
import { MemberConfigService } from '../../../service/crm-promotion/member-config.service';
import { SearchPickerComponent } from '../search-picker/search-picker.component';

@Component({
  selector: 'app-inline-member',
  imports: [FormsModule, SearchPickerComponent],
  templateUrl: './inline-member.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './inline-member.component.scss',
})
export class InlineMemberComponent {
  limitTier = model.required<boolean>()
  allowAddTier = computed(() => !this.limitTier())
  members = model.required<TMember[]>()
  private readonly memberRef = computed(() => new Set(this.members().map(m => m.id)))

  private readonly memberService = inject(MemberConfigService)
  private readonly allMember = this.memberService.allMember
  readonly validMember = computed(() => {
    const ref = this.memberRef()
    return this.allMember().filter(m => !ref.has(m.id))
  })
  readonly memberName = (m: TMember) => m.memberName

  onSelectTier = (item: TMember) => {
    this.members.update(prev => [...prev, item])
  }
  onToggleTier = (event: boolean) => {
    if (!event) {
      this.members.set([])
    }
    this.limitTier.set(event)
  }
}
