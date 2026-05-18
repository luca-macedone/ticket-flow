import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Project, ProjectService } from '../../../services/project.service';
import { DatePipe } from '@angular/common';
import { BaseCard } from "../../../components/overview-cards/base-card/base-card";
import { TableColumn, DataTable } from '../../../components/tables/ticket-table/data-table';
import { AuthService } from '../../../services/auth.service';
import { SkeletonBlock } from '../../../components/skeleton/skeleton-block/skeleton-block';
import { AdminUser, UserService } from '../../../services/user.service';
import { ToastService } from '../../../components/toast/toast-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectField, SelectOption } from '../../../components/fields/select-field/select-field';

interface TicketRow { id: string; ticketCode: string; ticketName: string; status: string }
interface UserRow { id: string; userCode: string; name: string; email: string }

const TICKET_COLUMNS: TableColumn<TicketRow>[] = [
  { key: 'ticketCode', label: 'Code', getValue: (t) => t.ticketCode, cellClass: 'font-mono text-xs text-text/50' },
  { key: 'ticketName', label: 'Ticket', getValue: (t) => t.ticketName, cellClass: 'font-medium' },
  { key: 'status', label: 'Status', getValue: (t) => t.status, cellClass: 'text-text/70' },
];

const USER_COLUMNS: TableColumn<UserRow>[] = [
  { key: 'userCode', label: 'Code', getValue: (u) => u.userCode, cellClass: 'font-mono text-xs text-text/50' },
  { key: 'name', label: 'Name', getValue: (u) => u.name, cellClass: 'font-medium' },
  { key: 'email', label: 'Email', getValue: (u) => u.email, cellClass: 'text-text/70' },
];


@Component({
  selector: 'app-project-view',
  imports: [DatePipe, BaseCard, DataTable, SkeletonBlock, SelectField, ReactiveFormsModule],
  templateUrl: './project-view.html',
})
export class ProjectView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  allUsers = signal<AdminUser[]>([]);
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

  addMemberControl = new FormControl<string>('');
  addingMember = signal(false);

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const code = params.get('code');
      if (!code) return;
      try {
        this.loading.set(true);
        const data: Project = await firstValueFrom(this.projectService.getProjectByCode(code));
        this.project.set(data);

        if (this.isAdmin()) {
          const users = await firstValueFrom(this.userService.getUsers(1, 100));
          this.allUsers.set(users);
        }
      } catch {
        this.error.set('Project not found.');
      } finally {
        this.loading.set(false);
      }
    });
  }

  editProject() {
    this.router.navigate(['/dashboard/projects/', this.project()!.projectCode, 'edit']);
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

  availableUsers = computed(() => {
    const assigned = new Set((this.project()?.users ?? []).map(u => u.userCode));
    return this.allUsers()
      .filter(u => u.status === 'APPROVED' && !assigned.has(u.userCode ?? ''))
      .map(u => ({ value: u.userCode ?? '', label: `${u.name} (${u.email})` } satisfies SelectOption))
  });

  async addMember() {
    const userCode = this.addMemberControl.value;
    if (!userCode || this.addingMember()) return;
    this.addingMember.set(true);
    try {
      await firstValueFrom(this.projectService.addMember(this.project()!.projectCode!, userCode));
      const user = this.allUsers().find(u => u.userCode === userCode)!;
      this.project.update(p => p ? {
        ...p,
        users: [...(p.users ?? []), { id: user.id, userCode: user.userCode!, name: user.name, email: user.email }]
      } : p);
      this.addMemberControl.reset();
      this.toast.success('Member added.');
    } catch {
      this.toast.error('Failed to add member.');
    } finally {
      this.addingMember.set(false);
    }
  }

  async removeMember(userCode: string) {
    try {
      await firstValueFrom(this.projectService.removeMember(this.project()!.projectCode!, userCode));
      this.project.update(p => p ? {
        ...p,
        users: (p.users ?? []).filter(u => u.userCode !== userCode)
      } : p);
      this.toast.success('Member removed.');
    } catch {
      this.toast.error('Failed to remove member.');
    }
  }


  viewTicket(t: TicketRow) {
    this.router.navigate(['/dashboard/tickets', t.ticketCode]);
  }

  viewUser(u: UserRow) {
    this.router.navigate(['/dashboard/users', u.userCode]);
  }
}
