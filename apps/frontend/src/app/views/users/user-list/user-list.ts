import { Component, inject, signal } from '@angular/core';
import { AdminUser, UserService } from '../../../services/user.service';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-list',
  imports: [DatePipe],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList {
  private userService = inject(UserService);

  users = signal<AdminUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  approvingId = signal<string | null>(null);
  selectedRole = signal<'AGENT' | 'CUSTOMER'>('CUSTOMER');

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.loading.set(true);
      const res = await firstValueFrom(this.userService.getUsers());
      this.users.set(res);
    } catch {
      this.error.set("Users load failed.")
    } finally {
      this.loading.set(false);
    }
  }

  startApprove(id: string) {
    this.approvingId.set(id);
    this.selectedRole.set('CUSTOMER');
  }

  cancelApprove() {
    this.approvingId.set(null)
  }

  async confirmApprove(id: string) {
    try {
      const updated = await firstValueFrom(this.userService.approveUser(id, this.selectedRole()));
      this.users.update(list =>
        list.map(u =>
          u.id === id
            ? { ...u, ...updated }
            : u
        )
      );
    } catch {
      this.error.set("Approval failed. Retry.");
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

