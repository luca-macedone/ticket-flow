import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
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

@Component({
  selector: 'app-new-ticket',
  imports: [ReactiveFormsModule, BaseCard, InputField, TextareaField, SelectField, DateField, KeyValuePipe],
  templateUrl: './new-ticket.html',
  styleUrl: './new-ticket.css',
})
export class NewTicket implements OnInit {
  private ticketService = inject(TicketService);
  private projectService = inject(ProjectService);
  private router = inject(Router);

  form = new FormGroup({
    ticketName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    ticketDescription: new FormControl('', [Validators.maxLength(500)]),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    status: new FormControl(''),
    category: new FormControl(''),
    priority: new FormControl(''),
    projectId: new FormControl(''),
  }, { validators: dateRangeValidator });

  projects = signal<SelectOption[]>([]);
  errors: Record<string, string[]> = {};
  isSubmitting = signal(false);

  readonly statusOptions = TICKET_STATUS_OPTIONS;

  readonly categoryOptions = TICKET_CATEGORY_OPTIONS;

  readonly priorityOptions = TICKET_PRIORITY_OPTIONS;

  get hasErrors() { return Object.keys(this.errors).length > 0; }
  get hasDateRangeError() { return this.form.hasError('dateRange'); }

  async ngOnInit() {
    try {
      const data = await firstValueFrom(this.projectService.getProjects(1, 100));
      this.projects.set(data.map(p => ({ value: p.id, label: p.projectName })));
    } catch {
      this.errors = { api: ['Failed to load projects.'] };
    }
  }

  async onSubmit() {
    if (this.form.invalid || this.isSubmitting()) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    this.errors = {};
    try {
      const raw = this.form.getRawValue();
      const payload: any = {
        ticketName: raw.ticketName!,
        ...(raw.ticketDescription && { ticketDescription: raw.ticketDescription }),
        ...(raw.startDate && { startDate: raw.startDate }),
        ...(raw.endDate && { endDate: raw.endDate }),
        ...(raw.status && { status: raw.status }),
        ...(raw.category && { category: raw.category }),
        ...(raw.priority && { priority: raw.priority }),
        ...(raw.projectId && { projectId: raw.projectId }),
      };
      const ticket = await firstValueFrom(this.ticketService.create(payload));
      this.router.navigate(['/dashboard/tickets', ticket.id]);
    } catch (err: any) {
      this.errors = { api: [err.error?.message || 'Creation failed.'] };
    } finally {
      this.isSubmitting.set(false);
    }
  }

  cancel() { this.router.navigate(['/dashboard/tickets']); }
  reset() { this.form.reset(); this.errors = {}; }
}
