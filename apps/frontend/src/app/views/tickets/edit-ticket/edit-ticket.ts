import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { KeyValuePipe } from '@angular/common';
import { BaseCard } from '../../../components/overview-cards/base-card/base-card';
import { InputField } from '../../../components/fields/input-field/input-field';
import { TextareaField } from '../../../components/fields/textarea-field/textarea-field';
import { SelectField, SelectOption } from '../../../components/fields/select-field/select-field';
import { DateField } from '../../../components/fields/date-field/date-field';
import { TicketService } from '../../../services/ticket.service';
import { ProjectService } from '../../../services/project.service';
import { TICKET_CATEGORY_OPTIONS, TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS } from '../../../services/constants/ticket.constants';
import { dateRangeValidator } from '../../../services/ticket.validator';
import { SkeletonBlock } from "../../../components/skeleton/skeleton-block/skeleton-block";

@Component({
  selector: 'app-edit-ticket',
  imports: [ReactiveFormsModule, BaseCard, InputField, TextareaField, SelectField, DateField, KeyValuePipe, SkeletonBlock],
  templateUrl: './edit-ticket.html',
  styleUrl: './edit-ticket.css',
})
export class EditTicket implements OnInit {
  private ticketService = inject(TicketService);
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private code!: string;
  projects = signal<SelectOption[]>([]);
  loading = signal(true);
  errors: Record<string, string[]> = {};
  isSubmitting = signal(false);
  displayCode = signal('');

  form = new FormGroup({
    ticketCode: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    ticketName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    ticketDescription: new FormControl('', [Validators.maxLength(500)]),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    status: new FormControl(''),
    category: new FormControl(''),
    priority: new FormControl(''),
    projectId: new FormControl(''),
  }, { validators: dateRangeValidator });

  readonly statusOptions = TICKET_STATUS_OPTIONS;

  readonly categoryOptions = TICKET_CATEGORY_OPTIONS;

  readonly priorityOptions = TICKET_PRIORITY_OPTIONS;

  toDateInput = (val: string | null | undefined) => val?.substring(0, 10) ?? '';

  get hasErrors() { return Object.keys(this.errors).length > 0; }
  get hasDateRangeError() { return this.form.hasError('dateRange'); }

  async ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code')!;
    try {
      const [projectData, ticket] = await Promise.all([
        firstValueFrom(this.projectService.getProjects(1, 100)),
        firstValueFrom(this.ticketService.getByCode(this.code)),
      ]);
      this.projects.set(projectData.map(p => ({ value: p.id, label: p.projectName })));
      this.form.patchValue({
        ticketCode: ticket.ticketCode,
        ticketName: ticket.ticketName,
        ticketDescription: ticket.ticketDescription ?? '',
        startDate: this.toDateInput(ticket.startDate),
        endDate: this.toDateInput(ticket.endDate),
        status: ticket.status,
        category: ticket.category,
        priority: ticket.priority,
        projectId: ticket.projectId ?? '',
      });
      this.displayCode.set(this.code);
    } catch {
      this.errors = { api: ['Failed to load ticket.'] };
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (this.form.invalid || this.isSubmitting()) { this.form.markAllAsTouched(); return; }
    this.errors = {};
    this.isSubmitting.set(true);
    try {
      const raw = this.form.getRawValue();
      await firstValueFrom(this.ticketService.update(this.code, raw as any));
      this.router.navigate(['/dashboard/tickets', this.code]);
    } catch (err: any) {
      this.errors = { api: [err.error?.message || 'Update failed.'] };
    } finally {
      this.isSubmitting.set(false);
    }
  }

  cancel() { this.router.navigate(['/dashboard/tickets', this.code]); }
  reset() { this.form.reset(); this.errors = {}; }
}
