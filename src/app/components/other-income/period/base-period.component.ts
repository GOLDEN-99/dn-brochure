import { Directive, inject, output } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

/**
 * Abstract base class for period components
 * Provides common modal handling and success/fail event management
 */
@Directive()
export abstract class BasePeriodComponent {
  // Outputs for success and failure events
  success = output<string>();
  fail = output<string>();

  // Modal service injection
  protected modalServ = inject(NgbModal);

  /**
   * Opens a modal with the specified template reference
   * @param modalRef - The template reference to open
   * @param size - Optional modal size (default: 'lg')
   * @returns The modal reference
   */
  protected openModal(modalRef: any, size: string = 'lg'): NgbModalRef {
    return this.modalServ.open(modalRef, { size });
  }

  /**
   * Handles successful modal operations
   * Closes all modals and emits success event
   * @param value - Success message
   */
  onSuccess(value: string): void {
    this.modalServ.dismissAll();
    this.success.emit(value);
  }

  /**
   * Handles failed modal operations
   * Closes all modals and emits fail event
   * @param value - Error message
   */
  onFail(value: string): void {
    this.modalServ.dismissAll();
    this.fail.emit(value);
  }
}
