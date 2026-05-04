import { Component, inject } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { InputField } from '../../../components/fields/input-field/input-field';
import { TextareaField } from '../../../components/fields/textarea-field/textarea-field';
import { KeyValuePipe } from '@angular/common';
import { BaseCard } from "../../../components/overview-cards/base-card/base-card";

@Component({
  selector: 'app-new-company',
  imports: [ReactiveFormsModule, InputField, TextareaField, KeyValuePipe, BaseCard],
  templateUrl: './new-company.html',
  styleUrl: './new-company.css',
})
export class NewCompany {
  private companyService = inject(CompanyService);
  private router = inject(Router);

  form = new FormGroup({
    companyName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    nationality: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    referralEmail: new FormControl('', [Validators.required, Validators.email]),
    description: new FormControl('', [Validators.maxLength(500)]),
  });

  errors: Record<string, string[]> = {};

  get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errors = {};
    try {
      const company = await firstValueFrom(this.companyService.createCompany(this.form.getRawValue() as any));
      this.router.navigate(['/dashboard/companies', company.id]);
    } catch (err: any) {
      this.errors = { api: [err.error?.message || 'Creation failed.'] };
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/companies']);
  }

  reset() {
    this.form.reset();
    this.errors = {};
  }
}
