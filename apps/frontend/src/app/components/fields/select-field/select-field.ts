import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-field',
  imports: [ReactiveFormsModule],
  templateUrl: './select-field.html',
})
export class SelectField {
  label = input<string>('');
  id = input<string>('');
  control = input.required<FormControl>();
  options = input.required<SelectOption[]>();
  placeholder = input<string>('Select an option...');
  error = input<string | null>(null);

  get errorMessage(): string | null {
    const ext = this.error();
    if (ext) return ext;
    const ctrl = this.control();
    if (!ctrl.touched || !ctrl.errors) return null;
    const e = ctrl.errors;
    if (e['required']) return 'Please select an option';
    return 'Invalid selection';
  }

  get selectClass(): string {
    const base = 'px-6 py-2 bg-background/10 border rounded-xl ring-0 outline-none transition-all ease-in font-body w-full';
    return this.errorMessage
      ? `${base} border-primary/40 focus-visible:border-primary/60`
      : `${base} border-secondary/40 focus-visible:border-accent/40`;
  }
}
