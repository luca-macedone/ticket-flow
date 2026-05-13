import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Toast, ToastService } from '../toast-service';

@Component({
  selector: 'app-toast-container',
  imports: [NgIcon],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainer {
  readonly toast = inject(ToastService);

  iconFor(type: Toast['type']) {
    return { success: 'heroCheckCircle', error: 'heroXCircle', info: 'heroInformationCircle' }[type];
  }

  classFor(type: Toast['type']) {
    return {
      success: 'bg-accent/20 border-accent/50',
      error: 'bg-primary/20 border-primary/50',
      info: 'bg-secondary/20 border-secondary/50',
    }[type];
  }
}
