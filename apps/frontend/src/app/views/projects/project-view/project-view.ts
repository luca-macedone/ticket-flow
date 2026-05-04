import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Project, ProjectService } from '../../../services/project.service';
import { DatePipe } from '@angular/common';
import { BaseCard } from "../../../components/overview-cards/base-card/base-card";
import { TableColumn, DataTable } from '../../../components/tables/ticket-table/data-table';
import { AuthService } from '../../../services/auth.service';

type TicketRow = { id: string; ticketName: string; status: string };
type UserRow = { id: string; name: string; email: string };

const TICKET_COLUMNS: TableColumn<TicketRow>[] = [
  { key: 'ticketName', label: 'Ticket', getValue: (t) => t.ticketName, cellClass: 'font-medium' },
  { key: 'status', label: 'Status', getValue: (t) => t.status, cellClass: 'text-text/70' },
];

const USER_COLUMNS: TableColumn<UserRow>[] = [
  { key: 'name', label: 'Name', getValue: (u) => u.name, cellClass: 'font-medium' },
  { key: 'email', label: 'Email', getValue: (u) => u.email, cellClass: 'text-text/70' },
];


@Component({
  selector: 'app-project-view',
  imports: [DatePipe, BaseCard, DataTable],
  templateUrl: './project-view.html',
})
export class ProjectView {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  project = signal<Project | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly ticketColumns = TICKET_COLUMNS;
  readonly userColumns = USER_COLUMNS;
  ticketPage = signal(1);
  userPage = signal(1);
  readonly pageSize = 5;

  private auth = inject(AuthService);
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isAgent = computed(() => this.auth.user()?.role === 'agent');


  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (!id) return;
      try {
        this.loading.set(true);
        const data: Project = await firstValueFrom(this.projectService.getProjectById(id));
        this.project.set(data);
      } catch {
        this.error.set('Project not found.');
      } finally {
        this.loading.set(false);
      }
    });
  }

  editProject() {
    this.router.navigate(['/dashboard/projects/', this.project()!.id, 'edit']);
  }

  pagedTickets = computed(() => {
    const list = this.project()?.tickets ?? [];
    const start = (this.ticketPage() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  pagedUsers = computed(() => {
    const list = this.project()?.users ?? [];
    const start = (this.userPage() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  viewTicket(t: TicketRow) {
    this.router.navigate(['/dashboard/tickets', t.id]);
  }
}
