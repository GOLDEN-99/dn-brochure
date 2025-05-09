import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-in-out-list',
  imports: [RouterLink],
  templateUrl: './in-out-list.component.html',
  styleUrl: './in-out-list.component.scss'
})
export class InOutListComponent {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  mock = [
    {
      name: 'Express(admin)', duration: '20 นาที', admin: 'example1@test.com',
    },
    {
      name: 'ประตู1', duration: '30 นาที', admin: 'example2@test.com',
    },
    {
      name: 'ประตู2', duration: '30 นาที', admin: 'example3@test.com',
    },
    {
      name: 'ประตู3', duration: '30 นาที', admin: 'example4@test.com',
    },
  ]

  goTo(idx: number) {
    this.router.navigate([idx], { relativeTo: this.route })
  }
}
