import { Component, inject, signal, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { AdminUser, UserService } from '../../../services/user.service';
import { firstValueFrom } from 'rxjs';
import { DataTable, TableColumn } from '../../../components/tables/ticket-table/data-table';

@Component({
  selector: 'app-user-list',
  imports: [DataTable],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements AfterViewInit {
  private userService = inject(UserService);

  @ViewChild('actionsCell') actionsCellTemplate!: TemplateRef<{ $implicit: AdminUser }>;

  users = signal<AdminUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  columns = signal<TableColumn<AdminUser>[]>([]);

  approvingId = signal<string | null>(null);
  selectedRole = signal<'AGENT' | 'CUSTOMER'>('CUSTOMER');

  ngAfterViewInit() {
    this.columns.set([
      { key: 'name', label: 'Name', getValue: u => u.name },
      { key: 'email', label: 'Email', getValue: u => u.email },
      { key: 'role', label: 'Role', getValue: u => u.role.toLowerCase(), badgeClass: () => 'border border-secondary capitalize' },
      { key: 'status', label: 'Status', getValue: u => this.statusLabel(u.status), badgeClass: v => this.statusClass(v) },
      { key: 'createdAt', label: 'Registered', getValue: u => new Date(u.createdAt).toLocaleDateString('en-GB') },
      { key: 'actions', label: 'Actions', cellTemplate: this.actionsCellTemplate },
    ]);
  }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.loading.set(true);
      const res = await firstValueFrom(this.userService.getUsers());
      this.users.set(res);
    } catch {
      this.error.set('Users load failed.');
    } finally {
      this.loading.set(false);
    }
  }

  startApprove(id: string) {
    this.approvingId.set(id);
    this.selectedRole.set('CUSTOMER');
  }

  cancelApprove() {
    this.approvingId.set(null);
  }

  async confirmApprove(id: string) {
    try {
      const updated = await firstValueFrom(this.userService.approveUser(id, this.selectedRole()));
      this.users.update(list => list.map(u => u.id === id ? { ...u, ...updated } : u));
    } catch {
      this.error.set('Approval failed. Retry.');
    } finally {
      this.approvingId.set(null);
    }
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING_APPROVAL: 'bg-yellow-500/20 text-yellow-300',
      APPROVED: 'bg-green-500/20 text-green-300',
      REJECTED: 'bg-red-500/20 text-red-300',
    };
    return map[status] ?? '';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING_APPROVAL: 'On hold',
      APPROVED: 'Approved',
      REJECTED: 'Refused',
    };
    return map[status] ?? status;
  }
}
