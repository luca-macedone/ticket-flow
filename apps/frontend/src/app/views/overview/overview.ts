import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Ticket, TicketService } from '../../services/ticket.service';
import { firstValueFrom } from 'rxjs';
import { BaseCard } from '../../components/overview-cards/base-card/base-card';
import { DataTable, SortState, TableColumn } from '../../components/tables/ticket-table/data-table';
import { AdminService, OverviewData } from '../../services/admin.service';

interface AdminOverview {
  tickets: { open: number; resolved: number; avgResolutionHours: number };
  traffic: { date: string; count: number }[];
  agentWorkload: { agentId: string; agentName: string; open: number }[];
  byCategory: { category: string; count: number }[];
  byProject: { projectId: string; projectName: string; count: number }[];
  byCompany: { companyName: string; count: number }[];
}

const PRIORITY: Record<string, string> = {
  LOW: 'bg-slate-200 text-slate-700',
  MEDIUM: 'bg-yellow-200 text-yellow-800',
  HIGH: 'bg-orange-200 text-orange-800',
  URGENT: 'bg-red-200 text-red-800',
};

const STATUS: Record<string, string> = {
  ON_QUEUE: 'bg-slate-200 text-slate-700',
  ON_HOLD: 'bg-yellow-200 text-yellow-800',
  ON_APPROVAL: 'bg-purple-200 text-purple-800',
  APPROVED: 'bg-teal-200 text-teal-800',
  FULFILLMENT: 'bg-blue-200 text-blue-800',
  DONE: 'bg-green-200 text-green-800',
  REJECTED: 'bg-red-200 text-red-800',
  CANCELLED: 'bg-gray-200 text-gray-700',
};

const priorityBadge = (v: string) => PRIORITY[v] ?? 'bg-slate-200 text-slate-700';
const statusBadge = (v: string) => STATUS[v] ?? 'bg-slate-200 text-slate-700';

const AGENT_COLUMNS: TableColumn<Ticket>[] = [
  { key: 'ticketCode', label: 'Code', getValue: t => t.ticketCode, cellClass: 'font-mono text-xs text-text/50' },
  { key: 'ticketName', label: 'Title', getValue: t => t.ticketName, cellClass: 'font-medium', sortable: true },
  { key: 'project', label: 'Project', getValue: t => t.project?.projectName ?? '—', cellClass: 'text-text/70' },
  { key: 'priority', label: 'Priority', getValue: t => t.priority, badgeClass: priorityBadge, sortable: true },
  { key: 'status', label: 'Status', getValue: t => t.status, badgeClass: statusBadge, sortable: true },
  { key: 'createdAt', label: 'Created', getValue: t => new Date(t.createdAt).toLocaleDateString('it-IT'), cellClass: 'text-text/50', sortable: true },
];

const CUSTOMER_COLUMNS: TableColumn<Ticket>[] = [
  { key: 'ticketCode', label: 'Code', getValue: (t) => t.ticketCode, cellClass: 'font-mono text-xs text-text/50' },
  { key: 'ticketName', label: 'Title', getValue: (t) => t.ticketName, cellClass: 'font-medium' },
  { key: 'project', label: 'Project', getValue: (t) => t.project?.projectName ?? '—', cellClass: 'text-text/70' },
  { key: 'assignee', label: 'Assignee', getValue: (t) => t.assignee?.name ?? '—', cellClass: 'text-text/70' },
  { key: 'priority', label: 'Priority', getValue: (t) => t.priority, badgeClass: priorityBadge },
  { key: 'status', label: 'Status', getValue: (t) => t.status, badgeClass: statusBadge },
];

@Component({
  selector: 'app-overview',
  imports: [BaseCard, DataTable],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  private auth = inject(AuthService);
  private ticketService = inject(TicketService);
  private adminService = inject(AdminService);

  user = this.auth.user;
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isAgent = computed(() => this.auth.user()?.role === 'agent');

  adminOverview = signal<AdminOverview | null>(null);
  rows = signal<Ticket[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  sortParams = signal<SortState | null>(null);

  readonly pageSize = 10;
  currentPage = signal(1);
  totalItems = signal(0);

  readonly agentColumns = AGENT_COLUMNS;
  readonly customerColumns = CUSTOMER_COLUMNS;

  async goToPage(page: number) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const sort = this.sortParams();
      const role = this.auth.user()?.role;
      const obs = role === 'agent'
        ? this.ticketService.getMyQueue(page, this.pageSize, sort?.key, sort?.dir ?? undefined)
        : this.ticketService.getMyTickets(page, this.pageSize, sort?.key, sort?.dir ?? undefined);
      const { data, total } = await firstValueFrom(obs);
      this.rows.set(data);
      this.totalItems.set(total);
      this.currentPage.set(page);
    } catch {
      this.error.set('Failed to load overview.');
    } finally {
      this.loading.set(false);
    }
  }

  async ngOnInit() {
    if (this.auth.user()?.role === 'admin') {
      try {
        const data: OverviewData = await firstValueFrom(this.adminService.getOverview());
        this.adminOverview.set(data);
      } catch {
        this.error.set('Failed to load overview.');
      } finally {
        this.loading.set(false);
      }
    } else {
      await this.goToPage(1);
    }
  }

  onSort(state: SortState | null) {
    this.sortParams.set(state);
    this.goToPage(1);
  }
}
