import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { InputField } from '../../../components/fields/input-field/input-field';
import { TextareaField } from '../../../components/fields/textarea-field/textarea-field';
import { KeyValuePipe } from '@angular/common';
import { BaseCard } from '../../../components/overview-cards/base-card/base-card';
import { DateField } from "../../../components/fields/date-field/date-field";
import { SelectField, SelectOption } from "../../../components/fields/select-field/select-field";
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-edit-project',
  imports: [ReactiveFormsModule, InputField, TextareaField, KeyValuePipe, BaseCard, DateField, SelectField],
  templateUrl: './edit-project.html',
  styleUrl: './edit-project.css',
})
export class EditProject implements OnInit {
  private projectService = inject(ProjectService);
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private code!: string;
  displayCode = signal("");
  companies = signal<SelectOption[]>([]);
  loading = signal(true);
  errors: Record<string, string[]> = {};

  form = new FormGroup({
    projectName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    description: new FormControl('', [Validators.maxLength(500)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', []),
    companyId: new FormControl('', [Validators.required]),
  });

  toDateInput = (val: string | null | undefined) => val?.substring(0, 10) ?? '';

  get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  async ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code')!;
    try {
      const companyData = await firstValueFrom(this.companyService.getCompanies(1, 100));
      this.companies.set(companyData.map((c: any) => ({ value: c.id, label: c.companyName })));
      const project = await firstValueFrom(this.projectService.getProjectByCode(this.code));
      this.form.patchValue({
        projectName: project.projectName,
        description: project.description,
        startDate: this.toDateInput(project.startDate),
        endDate: this.toDateInput(project.endDate),
        companyId: project.companyId,
      });
      this.displayCode.set(project.projectCode ?? '');
    } catch (err) {
      this.errors = { api: ['Project not found.'] };
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
      await firstValueFrom(this.projectService.updateProject(this.code, this.form.getRawValue() as any));
      this.router.navigate(['/dashboard/projects', this.code]);
    } catch (err: any) {
      this.errors = { api: [err.error?.message || 'Update failed.'] };
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/projects', this.code]);
  }

  reset() {
    this.form.reset();
    this.errors = {};
  }
}
