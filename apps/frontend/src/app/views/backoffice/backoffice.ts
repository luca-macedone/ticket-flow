import { Component, inject, OnInit, signal, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminUser, UserService } from '../../services/user.service';
import { AdminLog, AdminService, SystemLog } from '../../services/admin.service';
import { ToastService } from '../../components/toast/toast-service';
import { DataTable, TableColumn } from '../../components/tables/ticket-table/data-table';

@Component({
  selector: 'app-backoffice',
  imports: [DataTable],
  templateUrl: './backoffice.html',
  styleUrl: './backoffice.css',
})
export class Backoffice implements OnInit, AfterViewInit {
  private userService = inject(UserService);
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private router = inject(Router);

  @ViewChild('approvalActions') approvalActionsTemplate!: TemplateRef<{ $implicit: AdminUser }>;

  readonly PAGE_SIZE = 20;

  // ── tab ────────────────────────────────────────────────
  selectedTab = signal<'approvals' | 'admin-logs' | 'system-logs'>('approvals');

  // ── approvals ──────────────────────────────────────────
  pendingUsers = signal<AdminUser[]>([]);
  approvalsLoading = signal(true);
  approvingCode = signal<string | null>(null);
  selectedRole = signal<'AGENT' | 'CUSTOMER'>('CUSTOMER');
  approvalColumns = signal<TableColumn<AdminUser>[]>([]);

  // ── admin logs ─────────────────────────────────────────
  adminLogs = signal<AdminLog[]>([]);
  adminLogsLoading = signal(false);
  adminLogsLoaded = signal(false);
  adminLogsTotal = signal(0);
  adminLogsPage = signal(1);

  readonly adminLogsColumns: TableColumn<AdminLog>[] = [
    { key: 'createdAt', label: 'Date', getValue: l => new Date(l.createdAt).toLocaleString('en-GB'), skeletonWidth: 'w-32' },
    { key: 'actor', label: 'Actor', getValue: l => `${l.actor.name} (${l.actor.userCode ?? ''})`, cellClass: 'text-xs', skeletonWidth: 'w-36' },
    { key: 'action', label: 'Action', getValue: l => l.action, badgeClass: v => this.actionBadge(v), skeletonWidth: 'w-28' },
    { key: 'targetType', label: 'Type', getValue: l => l.targetType, skeletonWidth: 'w-20' },
    { key: 'targetCode', label: 'Ref', getValue: l => l.targetCode ?? '—', cellClass: 'font-mono text-xs text-text/50', skeletonWidth: 'w-24' },
    { key: 'targetLabel', label: 'Label', getValue: l => l.targetLabel ?? '—', cellClass: 'text-text/70', skeletonWidth: 'w-40' },
  ];

  // ── system logs ────────────────────────────────────────
  systemLogs = signal<SystemLog[]>([]);
  systemLogsLoading = signal(false);
  systemLogsLoaded = signal(false);
  systemLogsTotal = signal(0);
  systemLogsPage = signal(1);

  readonly systemLogsColumns: TableColumn<SystemLog>[] = [
    { key: 'createdAt', label: 'Date', getValue: l => new Date(l.createdAt).toLocaleString('en-GB'), skeletonWidth: 'w-32' },
    { key: 'level', label: 'Level', getValue: l => l.level, badgeClass: v => this.levelBadge(v), skeletonWidth: 'w-16' },
    { key: 'message', label: 'Message', getValue: l => l.message, cellClass: 'font-mono text-xs', skeletonWidth: 'w-96' },
  ];

  // ── lifecycle ──────────────────────────────────────────
  ngAfterViewInit() {
    this.approvalColumns.set([
      { key: 'userCode', label: 'Code', getValue: u => u.userCode ?? '', cellClass: 'font-mono text-xs text-text/50', skeletonWidth: 'w-20' },
      { key: 'name', label: 'Name', getValue: u => u.name, skeletonWidth: 'w-36' },
      { key: 'email', label: 'Email', getValue: u => u.email, skeletonWidth: 'w-44' },
      { key: 'createdAt', label: 'Registered', getValue: u => new Date(u.createdAt).toLocaleDateString('en-GB'), skeletonWidth: 'w-20' },
      { key: 'actions', label: '', cellTemplate: this.approvalActionsTemplate },
    ]);
  }

  async ngOnInit() { await this.loadPendingUsers(); }

  // ── loaders ────────────────────────────────────────────
  async loadPendingUsers() {
    try {
      this.approvalsLoading.set(true);
      const all = await firstValueFrom(this.userService.getUsers());
      this.pendingUsers.set(all.filter(u => u.status === 'PENDING_APPROVAL'));
    } catch {
      this.toast.error('Failed to load pending users.');
    } finally {
      this.approvalsLoading.set(false);
    }
  }

  async switchTab(tab: typeof this.selectedTab extends ReturnType<infer F> ? Parameters<F>[0] : never) {
    this.selectedTab.set(tab);
    if (tab === 'admin-logs' && !this.adminLogsLoaded()) await this.loadAdminLogs(1);
    if (tab === 'system-logs' && !this.systemLogsLoaded()) await this.loadSystemLogs(1);
  }

  async loadAdminLogs(page: number) {
    try {
      this.adminLogsLoading.set(true);
      const res = await firstValueFrom(this.adminService.getAdminLogs(page, this.PAGE_SIZE));
      this.adminLogs.set(res.data);
      this.adminLogsTotal.set(res.total);
      this.adminLogsPage.set(page);
      this.adminLogsLoaded.set(true);
    } catch {
      this.toast.error('Failed to load admin logs.');
    } finally {
      this.adminLogsLoading.set(false);
    }
  }

  async loadSystemLogs(page: number) {
    try {
      this.systemLogsLoading.set(true);
      const res = await firstValueFrom(this.adminService.getSystemLogs(page, this.PAGE_SIZE));
      this.systemLogs.set(res.data);
      this.systemLogsTotal.set(res.total);
      this.systemLogsPage.set(page);
      this.systemLogsLoaded.set(true);
    } catch {
      this.toast.error('Failed to load system logs.');
    } finally {
      this.systemLogsLoading.set(false);
    }
  }

  // ── approval actions ───────────────────────────────────
  startApprove(code: string) { this.approvingCode.set(code); this.selectedRole.set('CUSTOMER'); }
  cancelApprove() { this.approvingCode.set(null); }

  async confirmApprove(code: string) {
    try {
      await firstValueFrom(this.userService.approveUser(code, this.selectedRole()));
      this.pendingUsers.update(list => list.filter(u => u.userCode !== code));
      this.toast.success('User approved.');
    } catch { this.toast.error('Approval failed.'); }
    finally { this.approvingCode.set(null); }
  }

  async rejectUser(code: string) {
    try {
      await firstValueFrom(this.adminService.changeUserStatus(code, 'REJECTED'));
      this.pendingUsers.update(list => list.filter(u => u.userCode !== code));
      this.toast.success('User rejected.');
    } catch { this.toast.error('Action failed.'); }
  }

  viewUser(user: AdminUser) { this.router.navigate(['/dashboard/users', user.userCode]); }

  // ── badge helpers ─────────────────────────────────────
  actionBadge(action: string): string {
    if (action.endsWith('_CREATE') || action.endsWith('_APPROVE') || action.endsWith('_REACTIVATE'))
      return 'bg-accent/20 border border-accent/40 text-accent';
    if (action.endsWith('_UPDATE'))
      return 'bg-secondary/30 border border-secondary/40 text-text';
    return 'bg-primary/20 border border-primary/40 text-primary';
  }

  levelBadge(level: string): string {
    return { ERROR: 'bg-red-500/20 text-red-400', WARN: 'bg-yellow-500/20 text-yellow-400', INFO: 'bg-blue-500/20 text-blue-400' }[level] ?? '';
  }
}
