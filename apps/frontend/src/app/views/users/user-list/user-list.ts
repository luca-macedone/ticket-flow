import { Component, inject, signal, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { AdminUser, UserService } from '../../../services/user.service';
import { firstValueFrom } from 'rxjs';
import { DataTable, TableColumn } from '../../../components/tables/ticket-table/data-table';
import { Router } from '@angular/router';
import { ROLE_BADGE, userStatusBadge } from '../../../services/constants/badge.constants';
import { USER_STATUS_LABEL } from '../../../services/constants/user.constants';
import { ToastService } from '../../../components/toast/toast-service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-user-list',
  imports: [DataTable],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements AfterViewInit {
  private userService = inject(UserService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private toast = inject(ToastService);

  @ViewChild('actionsCell') actionsCellTemplate!: TemplateRef<{ $implicit: AdminUser }>;

  users = signal<AdminUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  columns = signal<TableColumn<AdminUser>[]>([]);

  approvingCode = signal<string | null>(null);
  selectedRole = signal<'AGENT' | 'CUSTOMER'>('CUSTOMER');

  ngAfterViewInit() {
    this.columns.set([
      { key: 'userCode', label: 'Code', getValue: u => u.userCode as string, cellClass: "font-mono text-xs text-text/50", skeletonWidth: 'w-20' },
      { key: 'name', label: 'Name', getValue: u => u.name, skeletonWidth: 'w-36' },
      { key: 'email', label: 'Email', getValue: u => u.email, skeletonWidth: 'w-44' },
      { key: 'role', label: 'Role', getValue: u => u.role.toLowerCase(), badgeClass: () => ROLE_BADGE, skeletonWidth: 'w-20' },
      { key: 'status', label: 'Status', getValue: u => USER_STATUS_LABEL[u.status], badgeClass: userStatusBadge, skeletonWidth: 'w-24' },
      { key: 'createdAt', label: 'Registered', getValue: u => new Date(u.createdAt).toLocaleDateString('en-GB'), skeletonWidth: 'w-20' },
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
      this.toast.error('Users load failed.');
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
      this.toast.success('User approved.');
    } catch {
      this.toast.error('Approval failed. Retry.');
    } finally {
      this.approvingCode.set(null);
    }
  }

  async rejectUser(code: string) {
    try {
      const updated = await firstValueFrom(this.adminService.changeUserStatus(code, 'REJECTED'));
      this.users.update(list => list.map(u => u.userCode === code ? { ...u, ...updated } : u));
      this.toast.success('User rejected.');
    } catch {
      this.toast.error('Action failed. Retry.');
    }
  }

  async suspendUser(code: string) {
    try {
      const updated = await firstValueFrom(this.adminService.changeUserStatus(code, 'SUSPENDED'));
      this.users.update(list => list.map(u => u.userCode === code ? { ...u, ...updated } : u));
      this.toast.success('User suspended.');
    } catch {
      this.toast.error('Action failed. Retry.');
    }
  }

  async reactivateUser(code: string) {
    try {
      const updated = await firstValueFrom(this.adminService.changeUserStatus(code, 'APPROVED'));
      this.users.update(list => list.map(u => u.userCode === code ? { ...u, ...updated } : u));
      this.toast.success('User reactivated.');
    } catch {
      this.toast.error('Action failed. Retry.');
    }
  }

  viewUser(user: AdminUser) {
    this.router.navigate(['/dashboard/users', user.userCode]);
  }

  newUser() {
    this.router.navigate(['/dashboard/users/new']);
  }
}
