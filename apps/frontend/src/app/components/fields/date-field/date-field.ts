import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-field',
  imports: [ReactiveFormsModule],
  templateUrl: './date-field.html',
})
export class DateField {
  label = input<string>('');
  id = input<string>('');
  placeholder = input<string>('');
  min = input<string>('');
  max = input<string>('');
  control = input.required<FormControl>();
  error = input<string | null>(null);

  get errorMessage(): string | null {
    const ext = this.error();
    if (ext) return ext;
    const ctrl = this.control();
    if (!ctrl.touched || !ctrl.errors) return null;
    const e = ctrl.errors;
    if (e['required']) return 'This field is required';
    if (e['min']) return `Date must be on or after ${e['min'].min}`;
    if (e['max']) return `Date must be on or before ${e['max'].max}`;
    return 'Invalid date';
  }

  get inputClass(): string {
    const base = 'px-6 py-2 bg-background/10 border rounded-xl ring-0 outline-none transition-all ease-in font-body w-full';
    return this.errorMessage
      ? `${base} border-primary/40 focus-visible:border-primary/60`
      : `${base} border-secondary/40 focus-visible:border-accent/40`;
  }
}
