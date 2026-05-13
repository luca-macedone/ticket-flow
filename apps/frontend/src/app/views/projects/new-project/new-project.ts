import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { InputField } from '../../../components/fields/input-field/input-field';
import { TextareaField } from '../../../components/fields/textarea-field/textarea-field';
import { KeyValuePipe } from '@angular/common';
import { BaseCard } from '../../../components/overview-cards/base-card/base-card';
import { DateField } from "../../../components/fields/date-field/date-field";
import { CompanyService } from '../../../services/company.service';
import { SelectOption, SelectField } from '../../../components/fields/select-field/select-field';
import { ToastService } from '../../../components/toast/toast-service';
import { toISODate } from '../../../utils/zod-form.utils';

@Component({
  selector: 'app-new-project',
  imports: [ReactiveFormsModule, InputField, TextareaField, KeyValuePipe, BaseCard, DateField, SelectField],
  templateUrl: './new-project.html',
  styleUrl: './new-project.css',
})
export class NewProject implements OnInit {
  private projectService = inject(ProjectService);
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private toast = inject(ToastService);

  form = new FormGroup({
    projectName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    description: new FormControl('', [Validators.maxLength(500)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', []),
    companyId: new FormControl('', [Validators.required]),
  });

  companies = signal<SelectOption[]>([]);
  errors: Record<string, string[]> = {};
  isSubmitting = signal(false);

  get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  async ngOnInit() {
    try {
      const companyData = await firstValueFrom(this.companyService.getCompanies(1, 100));
      this.companies.set(companyData.map((c: any) => ({ value: c.id, label: c.companyName })));
    } catch (err) {
      this.toast.error('Failed to load companies.');
    }
  }

  async onSubmit() {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errors = {};
    try {
      const project = await firstValueFrom(this.projectService.createProject({
        ...this.form.getRawValue() as any,
        startDate: toISODate(this.form.getRawValue().startDate),
        endDate: toISODate(this.form.getRawValue().endDate),
      }));
      this.toast.success('Project created.')
      this.router.navigate(['/dashboard/projects', project.projectCode]);
    } catch (err: any) {
      const fieldErrors = err.error?.errors?.fieldErrors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        this.errors = fieldErrors;
      } else {
        this.toast.error(err.error?.message || 'Creation failed.');
      }
    } finally {
      this.isSubmitting.set(false)
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/projects']);
  }

  reset() {
    this.form.reset();
    this.errors = {};
  }
}
