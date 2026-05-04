import { Component, inject, OnInit, signal } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { BaseCard } from '../../../components/overview-cards/base-card/base-card';
import { KeyValuePipe } from '@angular/common';
import { TextareaField } from '../../../components/fields/textarea-field/textarea-field';
import { InputField } from '../../../components/fields/input-field/input-field';

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

  private id!: string;
  loading = signal(true);
  errors: Record<string, string[]> = {};

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
    this.id = this.route.snapshot.paramMap.get('id')!;
    try {
      const company = await firstValueFrom(this.companyService.getCompanyById(this.id));
      this.form.patchValue({
        companyName: company.companyName,
        nationality: company.nationality,
        referralEmail: company.referralEmail,
        description: company.description,
      });
    } catch (err) {
      this.errors = { api: ['Company not found.'] };
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
      await firstValueFrom(this.companyService.updateCompany(this.id, this.form.getRawValue() as any));
      this.router.navigate(['/dashboard/companies', this.id]);
    } catch (err: any) {
      this.errors = { api: ['Update failed.'] };
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/companies', this.id]);
  }

  reset() {
    this.form.reset();
    this.errors = {};
  }
}
