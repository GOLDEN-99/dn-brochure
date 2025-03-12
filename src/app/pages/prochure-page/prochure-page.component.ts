import { Component, inject, OnInit, signal } from '@angular/core';
import { ProchureComponent } from "../../components/prochure/prochure.component";
import { ActivatedRoute } from '@angular/router';
import { TColor, TSupplier } from '../../types';

@Component({
  selector: 'app-prochure-page',
  standalone: true,
  imports: [ProchureComponent],
  templateUrl: './prochure-page.component.html',
  styleUrl: './prochure-page.component.scss'
})
export class ProchurePageComponent implements OnInit {
  private route = inject(ActivatedRoute)

  color = signal<TColor>("green")
  supplier = signal<TSupplier>("gen")

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (p) => {
        console.log(p)
        const supplier = p['supplier'] ?? "gen"
        this.supplier.update(() => supplier)
        const clr = p['color'] ?? "green"
        this.color.update(() => clr)
      }
    )
  }
}
