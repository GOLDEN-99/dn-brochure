import { Component, computed, inject, model } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { TMember } from '../../../types/crm-promotion.type';
import { MemberConfigService } from '../../../service/crm-promotion/member-config.service';

@Component({
  selector: 'app-inline-member',
  imports: [NgbTypeahead, FormsModule],
  templateUrl: './inline-member.component.html',
  styleUrl: './inline-member.component.scss',
})
export class InlineMemberComponent {
  limitTier = model.required<boolean>()
  allowAddTier = computed(() => !this.limitTier())
  members = model.required<TMember[]>()
  private readonly memberRef = computed(() => new Set(this.members().map(m => m.id)))
  // private readonly mock_tier = [
  //   { id: 1, name: 'ลูกค้าทั่วไป', typeCode: '0' },
  //   { id: 2, name: 'line crm', typeCode: '1' },
  //   { id: 3, name: 'HUG CLUB - BRONZE', typeCode: '2' },
  //   { id: 4, name: 'HUG CLUB - SILVER', typeCode: '2' },
  //   { id: 5, name: 'HUG CLUB - GOLD', typeCode: '2' },
  //   { id: 6, name: 'พนักงาน', typeCode: '3' },
  // ]
  private readonly memberService = inject(MemberConfigService)
  private readonly allMember = this.memberService.allMember
  private readonly validMember = computed(() => {
    const ref = this.memberRef()
    return this.allMember().filter(m => !ref.has(m.id))
  })
  searchTier = (text$: Observable<string>) => text$
    .pipe(
      map(t => {
        const lowerT = t.toLocaleLowerCase()
        return this.validMember()
          .filter(
            tier => tier.memberName.toLowerCase().includes(lowerT)
          )
      })
    )

  onSelectTier = ({ item }: NgbTypeaheadSelectItemEvent<TMember>) => {
    this.members.update(prev => [...prev, item])
  }
  onToggleTier = (event: boolean) => {
    if (!event) {
      this.members.set([])
    }
    this.limitTier.set(event)
  }
}
