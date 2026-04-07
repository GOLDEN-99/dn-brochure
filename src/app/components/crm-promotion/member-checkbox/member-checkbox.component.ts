import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-checkbox',
  imports: [FormsModule],
  templateUrl: './member-checkbox.component.html',
  styleUrl: './member-checkbox.component.scss'
})
export class MemberCheckboxComponent {
  members = input.required<TMember>()
  changeMembers = output<TMember>()
  allowAllMembers = computed(() => this.members().reduce((acc, cur) => acc && cur, true))
  allowHugClub = computed(() => {
    const current = this.members()
    return current[2] && current[3] && current[4]
  })

  onToggleAllMember(eve: boolean) {
    this.changeMembers.emit(Array.from({ length: 7 }).map(_ => eve) as TMember)
  }

  onToggleEveryHugclub(eve: boolean) {
    this.changeMembers.emit(this.members().map((v, i) => [2, 3, 4].includes(i) ? eve : v) as TMember)
  }

  onToggleMember(eve: boolean, idx: number) {
    this.changeMembers.emit(this.members().map((v, i) => i === idx ? eve : v) as TMember)
  }
}

type TMember = [boolean, boolean, boolean, boolean, boolean, boolean, boolean]