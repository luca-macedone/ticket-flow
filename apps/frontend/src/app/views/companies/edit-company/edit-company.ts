import { Component, inject, OnInit, signal } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { BaseCard } from '../../../components/overview-cards/base-card/base-card';
import { KeyValuePipe } from '@angular/common';
import { TextareaField } from '../../../components/fields/textarea-field/textarea-field';
import { InputField } from '../../../components/fields/input-field/input-field';
import { ToastService } from '../../../components/toast/toast-service';

@Component({
  selector: 'app-edit-company',
  imports: [ReactiveFormsModule, InputField, TextareaField, KeyValuePipe, BaseCard],
  templateUrl: './edit-company.html',
  styleUrl: './edit-company.css',
})
export class EditCompany implements OnInit {
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  private code!: string;
  loading = signal(true);
  errors: Record<string, string[]> = {};
  displayCode = signal("");

  form = new FormGroup({
    companyName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    nationality: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    referralEmail: new FormControl('', [Validators.required, Validators.email]),
    description: new FormControl('', [Validators.maxLength(500)]),
  });

  get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  async ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code')!;
    try {
      const company = await firstValueFrom(this.companyService.getCompanyByCode(this.code));
      this.form.patchValue({
        companyName: company.companyName,
        nationality: company.nationality,
        referralEmail: company.referralEmail,
        description: company.description,
      });
      this.displayCode.set(company.companyCode ?? '')
    } catch (err) {
      this.toast.error('Company not found.');
    } finally {
      this.loading.set(false);
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errors = {};
    try {
      await firstValueFrom(this.companyService.updateCompany(this.code, this.form.getRawValue() as any));
      this.toast.success('Company updated.');
      this.router.navigate(['/dashboard/companies', this.code]);
    } catch (err: any) {
      const fieldErrors = err.error?.errors?.fieldErrors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        this.errors = fieldErrors;
      } else {
        this.toast.error(err.error?.message || 'Patch failed.');
      }
    }

  }

  cancel() {
    this.router.navigate(['/dashboard/companies', this.code]);
  }

  reset() {
    this.form.reset();
    this.errors = {};
  }
}
