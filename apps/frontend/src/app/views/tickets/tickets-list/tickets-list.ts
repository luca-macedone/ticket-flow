import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Ticket, TicketService } from '../../../services/ticket.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TableColumn, DataTable, SortState } from '../../../components/tables/ticket-table/data-table';
import { firstValueFrom } from 'rxjs';
import { PRIORITY_BADGE, STATUS_BADGE } from '../../../services/constants/badge.constants';

const COLUMNS: TableColumn<Ticket>[] = [
  { key: 'ticketCode', label: 'Code', getValue: t => t.ticketCode, cellClass: 'font-mono text-xs text-text/50', skeletonWidth: 'w-20' },
  { key: 'ticketName', label: 'Title', getValue: t => t.ticketName, cellClass: 'font-medium', sortable: true, skeletonWidth: 'w-48' },
  { key: 'project', label: 'Project', getValue: t => t.project?.projectName ?? '—', cellClass: 'text-text/70', skeletonWidth: 'w-32' },
  { key: 'priority', label: 'Priority', getValue: t => t.priority, badgeClass: v => PRIORITY_BADGE[v] ?? 'bg-slate-200 text-slate-700', sortable: true, skeletonWidth: 'w-16' },
  { key: 'status', label: 'Status', getValue: t => t.status, badgeClass: v => STATUS_BADGE[v] ?? 'bg-slate-200 text-slate-700', sortable: true, skeletonWidth: 'w-24' },
  { key: 'createdAt', label: 'Created', getValue: t => new Date(t.createdAt).toLocaleDateString('it-IT'), cellClass: 'text-text/50', sortable: true, skeletonWidth: 'w-20' },
];

@Component({
  selector: 'app-tickets-list',
  imports: [DataTable],
  templateUrl: './tickets-list.html',
  styleUrl: './tickets-list.css',
})
export class TicketsList implements OnInit {
  private ticketService = inject(TicketService);
  private router = inject(Router);
  private auth = inject(AuthService);

  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isAgent = computed(() => this.auth.user()?.role === 'agent');

  readonly columns = COLUMNS;
  readonly pageSize = 20;

  rows = signal<Ticket[]>([]);
  loading = signal(true);
  refreshing = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalItems = signal(0);
  sortParams = signal<SortState | null>(null);

  async ngOnInit() {
    await this.goToPage(1);
  }

  async goToPage(page: number) {
    if (!this.loading()) this.refreshing.set(true);
    this.error.set(null);
    try {
      const sort = this.sortParams();
      const role = this.auth.user()?.role;
      const obs = (role === 'admin' || role === 'agent')
        ? this.ticketService.getAll(page, this.pageSize, sort?.key, sort?.dir ?? undefined)
        : this.ticketService.getMyTickets(page, this.pageSize, sort?.key, sort?.dir ?? undefined);
      const { data, total } = await firstValueFrom(obs);
      this.rows.set(data);
      this.totalItems.set(total);
      this.currentPage.set(page);
    } catch {
      this.error.set('Failed to load tickets.');
    } finally {
      this.loading.set(false);
      this.refreshing.set(false);
    }
  }

  onSort(state: SortState | null) {
    this.sortParams.set(state);
    this.goToPage(1);
  }


  viewTicket(ticket: Ticket) {
    this.router.navigate(['/dashboard/tickets', ticket.ticketCode]);
  }

  newTicket() {
    this.router.navigate(['/dashboard/tickets/new']);
  }
}
