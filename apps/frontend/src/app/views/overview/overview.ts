import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Ticket, TicketService } from '../../services/ticket.service';
import { firstValueFrom } from 'rxjs';
import { BaseCard } from '../../components/overview-cards/base-card/base-card';
import { DataTable, SortState, TableColumn } from '../../components/tables/ticket-table/data-table';
import { AdminService, OverviewData } from '../../services/admin.service';
import { PRIORITY_BADGE, STATUS_BADGE } from '../../services/constants/badge.constants';
import { RouterLinkWithHref } from '@angular/router';

interface AdminOverview {
  tickets: { open: number; resolved: number; avgResolutionHours: number };
  traffic: { date: string; count: number }[];
  agentWorkload: { agentId: string; agentName: string; open: number }[];
  byCategory: { category: string; count: number }[];
  byProject: { projectId: string; projectName: string; count: number }[];
  byCompany: { companyName: string; count: number }[];
}

const priorityBadge = (v: string) => PRIORITY_BADGE[v] ?? 'bg-slate-200 text-slate-700';
const statusBadge = (v: string) => STATUS_BADGE[v] ?? 'bg-slate-200 text-slate-700';

const AGENT_COLUMNS: TableColumn<Ticket>[] = [
  { key: 'ticketCode', label: 'Code', getValue: t => t.ticketCode, cellClass: 'font-mono text-xs text-text/50', skeletonWidth: 'w-20' },
  { key: 'ticketName', label: 'Title', getValue: t => t.ticketName, cellClass: 'font-medium', sortable: true, skeletonWidth: 'w-44' },
  { key: 'project', label: 'Project', getValue: t => t.project?.projectName ?? '—', cellClass: 'text-text/70', skeletonWidth: 'w-28' },
  { key: 'priority', label: 'Priority', getValue: t => t.priority, badgeClass: priorityBadge, sortable: true, skeletonWidth: 'w-16' },
  { key: 'status', label: 'Status', getValue: t => t.status, badgeClass: statusBadge, sortable: true, skeletonWidth: 'w-24' },
  { key: 'createdAt', label: 'Created', getValue: t => new Date(t.createdAt).toLocaleDateString('it-IT'), cellClass: 'text-text/50', sortable: true, skeletonWidth: 'w-20' },
];

const CUSTOMER_COLUMNS: TableColumn<Ticket>[] = [
  { key: 'ticketCode', label: 'Code', getValue: (t) => t.ticketCode, cellClass: 'font-mono text-xs text-text/50', skeletonWidth: 'w-20' },
  { key: 'ticketName', label: 'Title', getValue: (t) => t.ticketName, cellClass: 'font-medium', skeletonWidth: 'w-44' },
  { key: 'project', label: 'Project', getValue: (t) => t.project?.projectName ?? '—', cellClass: 'text-text/70', skeletonWidth: 'w-28' },
  { key: 'assignee', label: 'Assignee', getValue: (t) => t.assignee?.name ?? '—', cellClass: 'text-text/70', skeletonWidth: 'w-18' },
  { key: 'priority', label: 'Priority', getValue: (t) => t.priority, badgeClass: priorityBadge, skeletonWidth: 'w-16' },
  { key: 'status', label: 'Status', getValue: (t) => t.status, badgeClass: statusBadge, skeletonWidth: 'w-24' },
];

@Component({
  selector: 'app-overview',
  imports: [BaseCard, DataTable, RouterLinkWithHref],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  private auth = inject(AuthService);
  private ticketService = inject(TicketService);
  adminService = inject(AdminService);

  user = this.auth.user;
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isAgent = computed(() => this.auth.user()?.role === 'agent');

  adminOverview = signal<AdminOverview | null>(null);
  rows = signal<Ticket[]>([]);
  loading = signal(true);
  refreshing = signal(false);
  error = signal<string | null>(null);
  sortParams = signal<SortState | null>(null);

  readonly pageSize = 10;
  currentPage = signal(1);
  totalItems = signal(0);

  readonly agentColumns = AGENT_COLUMNS;
  readonly customerColumns = CUSTOMER_COLUMNS;

  async goToPage(page: number) {
    if (this.loading()) {
      // If we're already loading... nothing to do
    } else {
      this.refreshing.set(true);
    }
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
      this.refreshing.set(false);
    }
  }

  async ngOnInit() {
    if (this.auth.user()?.role === 'admin') {
      try {
        const data: OverviewData = await firstValueFrom(this.adminService.getOverview());
        this.adminOverview.set(data);
        this.adminService.setPendingCount(data.pendingCount);
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
