import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminUser, UserService } from '../../../services/user.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { TableColumn, DataTable } from '../../../components/tables/ticket-table/data-table';
import { BaseCard } from "../../../components/overview-cards/base-card/base-card";
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

type TicketRow = { id: string; ticketName: string; status: string };
type ProjectRow = { id: string; projectName: string };

const PROJECT_COLUMNS: TableColumn<ProjectRow>[] = [
  { key: 'projectName', label: 'Name', getValue: (p) => p.projectName, cellClass: 'font-medium' },
];

const TICKET_COLUMNS: TableColumn<TicketRow>[] = [
  { key: 'ticketName', label: 'Ticket', getValue: (t) => t.ticketName, cellClass: 'font-medium' },
  { key: 'status', label: 'Status', getValue: (t) => t.status, cellClass: 'text-text/70' },
];

@Component({
  selector: 'app-user-view',
  imports: [BaseCard, DataTable, DatePipe],
  templateUrl: './user-view.html',
  styleUrl: './user-view.css',
})
export class UserView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  user = signal<AdminUser | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly projectColumns = PROJECT_COLUMNS;
  readonly assignedTicketColumns = TICKET_COLUMNS;
  readonly reportedTicketColumns = TICKET_COLUMNS;
  assignedTicketPage = signal(1);
  reportedTicketPage = signal(1);
  projectPage = signal(1);
  readonly pageSize = 5;

  private auth = inject(AuthService);
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isAgent = computed(() => this.auth.user()?.role === 'agent');

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      try {
        this.loading.set(true);
        const data = await firstValueFrom(this.userService.getUserById(id!));
        this.user.set(data);
      } catch (error) {
        this.error.set('User not found.');
      } finally {
        this.loading.set(false);
      }
    });
  }

  editUser() {
    this.router.navigate(['/dashboard/users/', this.user()!.id, 'edit']);
  }

  pagedProjects = computed(() => {
    const list = this.user()?.projects ?? [];
    const start = (this.projectPage() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });
  pagedAssignedTickets = computed(() => {
    const list = this.user()?.assignedTickets ?? [];
    const start = (this.assignedTicketPage() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });
  pagedReportedTickets = computed(() => {
    const list = this.user()?.reportedTickets ?? [];
    const start = (this.reportedTicketPage() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  viewProject(p: ProjectRow) {
    this.router.navigate(['/dashboard/projects/', p.id]);
  }

  viewTicket(t: TicketRow) {
    this.router.navigate(['/dashboard/tickets', t.id]);
  }
}
