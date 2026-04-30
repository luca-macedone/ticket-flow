import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  imports: [ReactiveFormsModule],
  templateUrl: './input-field.html',
})
export class InputField {
  label = input<string>('');
  id = input<string>('');
  type = input<'text' | 'email' | 'password' | 'number' | 'search'>('text');
  placeholder = input<string>('');
  control = input.required<FormControl>();
  error = input<string | null>(null);

  get errorMessage(): string | null {
    const ext = this.error();
    if (ext) return ext;
    const ctrl = this.control();
    if (!ctrl.touched || !ctrl.errors) return null;
    const e = ctrl.errors;
    if (e['required']) return 'This field is required';
    if (e['email']) return 'Enter a valid email address';
    if (e['minlength']) return `At least ${e['minlength'].requiredLength} characters required`;
    if (e['maxlength']) return `Maximum ${e['maxlength'].requiredLength} characters allowed`;
    return 'Invalid value';
  }

  get inputClass(): string {
    const base = 'px-6 py-2 bg-background/10 border rounded-xl ring-0 outline-none transition-all ease-in font-body w-full';
    return this.errorMessage
      ? `${base} border-primary/40 focus-visible:border-primary/60`
      : `${base} border-secondary/40 focus-visible:border-accent/40`;
  }
}
