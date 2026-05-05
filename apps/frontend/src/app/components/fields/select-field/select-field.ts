import { Component, ElementRef, HostListener, input } from '@angular/core';
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

  open = false;
  dropdownPosition: 'up' | 'down' = 'down';
  dropdownMaxHeight = 240;

  constructor(private elRef: ElementRef) { }

  toggle() {
    if (!this.open) this.calculatePosition();
    this.open = !this.open;
  }

  select(value: string) {
    this.control().setValue(value);
    this.control().markAsTouched();
    this.open = false;
  }

  private calculatePosition() {
    const trigger = this.elRef.nativeElement.querySelector('button');
    const rect: DOMRect = trigger.getBoundingClientRect();
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const needed = Math.min((this.options().length + 1) * 36, 240);

    if (spaceBelow >= needed || spaceBelow >= spaceAbove) {
      this.dropdownPosition = 'down';
      this.dropdownMaxHeight = Math.max(80, Math.min(spaceBelow, 240));
    } else {
      this.dropdownPosition = 'up';
      this.dropdownMaxHeight = Math.max(80, Math.min(spaceAbove, 240));
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('app-select-field')) this.open = false;
  }

  get selectedLabel(): string {
    return this.options().find(o => o.value === this.control().value)?.label ?? '';
  }

  get triggerClass(): string {
    const base = 'flex items-center justify-between w-full px-4 py-2 bg-background/10 border rounded-xl outline-none transition-all ease-in font-body text-left';
    return this.errorMessage
      ? `${base} border-primary/40 focus-visible:border-primary/60`
      : `${base} border-secondary/40 focus-visible:border-accent/40`;
  }

  get errorMessage(): string | null {
    const ext = this.error();
    if (ext) return ext;
    const ctrl = this.control();
    if (!ctrl.touched || !ctrl.errors) return null;
    const e = ctrl.errors;
    if (e['required']) return 'Please select an option';
    return 'Invalid selection';
  }
}
