import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox-field',
  imports: [ReactiveFormsModule],
  templateUrl: './checkbox-field.html',
})
export class CheckboxField {
  label = input<string>('');
  id = input<string>('');
  control = input.required<FormControl>();
}
