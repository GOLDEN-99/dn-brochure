import { Component, computed, contentChildren, signal, TemplateRef, viewChildren } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';


@Component({
  selector: 'app-stepper',
  imports: [NgTemplateOutlet],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent {
  children = contentChildren(TemplateRef)
  currentPage = signal(0)
  maxPage = computed(() => this.children().length - 1)
  currentStep = computed(() => this.children()[this.currentPage()])
  isFirst = computed(() => this.currentPage() === 0)
  isLast = computed(() => this.currentPage() === this.maxPage())
  next() {
    this.currentPage.update(prev => prev < this.maxPage() ? prev + 1 : prev)
  }

  back() {
    this.currentPage.update(prev => prev === 0 ? 0 : prev - 1)
  }

}
