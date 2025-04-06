import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cn-layout',
  imports: [RouterOutlet],
  templateUrl: './cn-layout.component.html',
  styleUrl: './cn-layout.component.scss'
})
export class CnLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute)
  ngOnInit(): void {
    this.route.data.subscribe()
  }
}
