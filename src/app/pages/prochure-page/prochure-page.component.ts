import { Component, inject, OnInit, signal } from '@angular/core';
import { ProchureComponent } from "../../components/prochure/prochure.component";
import { ActivatedRoute, Router } from '@angular/router';
import { TColor, TSupplier } from '../../types';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-prochure-page',
  standalone: true,
  imports: [ProchureComponent, ReactiveFormsModule],
  templateUrl: './prochure-page.component.html',
  styleUrl: './prochure-page.component.scss'
})
export class ProchurePageComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
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

    this.navigateForm.valueChanges.subscribe({
      next: ({ color, supplier }) => {
        if (!color || !supplier) return
        this.router.navigate([], { queryParams: { color, supplier } })
      }
    })
  }

  private fb = inject(FormBuilder)
  navigateForm = this.fb.group(
    {
      color: this.fb.control<TColor>("green"),
      supplier: this.fb.control<TSupplier>("gen")
    }
  )

  onExport() {
    window.print();
  }
}
