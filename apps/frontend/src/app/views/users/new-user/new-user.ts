import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { InputField } from '../../../components/fields/input-field/input-field';
import { SelectField } from '../../../components/fields/select-field/select-field';
import { KeyValuePipe } from '@angular/common';
import { BaseCard } from '../../../components/overview-cards/base-card/base-card';

@Component({
  selector: 'app-new-user',
  imports: [ReactiveFormsModule, InputField, SelectField, KeyValuePipe, BaseCard],
  templateUrl: './new-user.html',
})
export class NewUser {
  private userService = inject(UserService);
  private router = inject(Router);

  readonly roleOptions = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'AGENT', label: 'Agent' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    role: new FormControl('CUSTOMER', [Validators.required]),
  });

  errors: Record<string, string[]> = {};
  get hasErrors() { return Object.keys(this.errors).length > 0; }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.errors = {};
    try {
      const user = await firstValueFrom(this.userService.createUser(this.form.getRawValue() as any));
      this.router.navigate(['/dashboard/users', user.id]);
    } catch (err: any) {
      this.errors = { api: [err.error?.message || 'Creation failed.'] };
    }
  }

  cancel() { this.router.navigate(['/dashboard/users']); }
  reset() { this.form.reset({ role: 'CUSTOMER' }); this.errors = {}; }
}
