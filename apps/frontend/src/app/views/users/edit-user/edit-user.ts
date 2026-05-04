import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { InputField } from '../../../components/fields/input-field/input-field';
import { SelectField } from '../../../components/fields/select-field/select-field';
import { KeyValuePipe } from '@angular/common';
import { BaseCard } from '../../../components/overview-cards/base-card/base-card';

@Component({
  selector: 'app-edit-user',
  imports: [ReactiveFormsModule, InputField, SelectField, KeyValuePipe, BaseCard],
  templateUrl: './edit-user.html',
})
export class EditUser implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private id!: string;
  loading = signal(true);
  errors: Record<string, string[]> = {};

  readonly roleOptions = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'AGENT', label: 'Agent' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', [Validators.required]),
  });

  get hasErrors() { return Object.keys(this.errors).length > 0; }

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    try {
      const user = await firstValueFrom(this.userService.getUserById(this.id));
      this.form.patchValue({ name: user.name, email: user.email, role: user.role });
    } catch {
      this.errors = { api: ['User not found.'] };
    } finally {
      this.loading.set(false);
    }
  }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.errors = {};
    try {
      await firstValueFrom(this.userService.updateUser(this.id, this.form.getRawValue() as any));
      this.router.navigate(['/dashboard/users', this.id]);
    } catch (err: any) {
      this.errors = { api: [err.error?.message || 'Update failed.'] };
    }
  }

  cancel() { this.router.navigate(['/dashboard/users', this.id]); }
  reset() { this.form.reset(); this.errors = {}; }
}
