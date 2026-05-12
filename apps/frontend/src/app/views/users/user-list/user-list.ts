import { Component, inject, signal, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { AdminUser, UserService } from '../../../services/user.service';
import { firstValueFrom } from 'rxjs';
import { DataTable, TableColumn } from '../../../components/tables/ticket-table/data-table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  imports: [DataTable],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements AfterViewInit {
  private userService = inject(UserService);
  private router = inject(Router);

  @ViewChild('actionsCell') actionsCellTemplate!: TemplateRef<{ $implicit: AdminUser }>;

  users = signal<AdminUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  columns = signal<TableColumn<AdminUser>[]>([]);

  approvingCode = signal<string | null>(null);
  selectedRole = signal<'AGENT' | 'CUSTOMER'>('CUSTOMER');

  ngAfterViewInit() {
    this.columns.set([
      { key: 'userCode', label: 'Code', getValue: u => u.userCode as string, cellClass: "font-mono text-xs text-text/50" },
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

  startApprove(code: string) {
    this.approvingCode.set(code);
    this.selectedRole.set('CUSTOMER');
  }

  cancelApprove() {
    this.approvingCode.set(null);
  }

  async confirmApprove(code: string) {
    try {
      const updated = await firstValueFrom(this.userService.approveUser(code, this.selectedRole()));
      this.users.update(list => list.map(u => u.userCode === code ? { ...u, ...updated } : u));
    } catch {
      this.error.set('Approval failed. Retry.');
    } finally {
      this.approvingCode.set(null);
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

  viewUser(user: AdminUser) {
    this.router.navigate(['/dashboard/users', user.userCode]);
  }

  newUser() {
    this.router.navigate(['/dashboard/users/new']);
  }
}
