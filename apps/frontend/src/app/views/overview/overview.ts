import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Task, TaskService } from '../../services/task.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DatePipe, NgClass } from '@angular/common';

interface AdminOverview {
  tickets: { open: number; resolved: number; avgResolutionHours: number };
  traffic: { date: string; count: number }[];
  agentWorkload: { agentId: string; agentName: string; open: number }[];
  byCategory: { category: string; count: number }[];
  byProject: { projectId: string; projectName: string; count: number }[];
  byCompany: { companyName: string; count: number }[];
}


@Component({
  selector: 'app-overview',
  imports: [NgClass, DatePipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  private auth = inject(AuthService);
  private taskService = inject(TaskService);
  private http = inject(HttpClient);

  isAgent = computed(() => this.auth.user()?.role === 'agent');

  adminOverview = signal<AdminOverview | null>(null);
  myQueue = signal<Task[]>([]);
  myTickets = signal<Task[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  user = this.auth.user;
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isPending = computed(() => this.auth.user()?.status === 'PENDING_APPROVAL');

  async ngOnInit() {
    const role = this.auth.user()?.role;
    try {
      if (role === 'admin') {
        const data = await firstValueFrom(
          this.http.get<AdminOverview>('/api/admin/overview', { withCredentials: true })
        );
        this.adminOverview.set(data);
      } else if (role === 'agent') {
        const { data } = await firstValueFrom(this.taskService.getMyQueue());
        this.myQueue.set(data);
      } else {
        const { data } = await firstValueFrom(this.taskService.getMyTickets());
        this.myTickets.set(data);
      }
    } catch {
      this.error.set('Failed to load overview.');
    } finally {
      this.loading.set(false);
    }
  }

  priorityClass(priority: string): string {
    const map: Record<string, string> = {
      LOW: 'bg-slate-200 text-slate-700',
      MEDIUM: 'bg-yellow-200 text-yellow-800',
      HIGH: 'bg-orange-200 text-orange-800',
      URGENT: 'bg-red-200 text-red-800',
    };
    return map[priority] ?? 'bg-slate-200 text-slate-700';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      ON_QUEUE: 'bg-slate-200 text-slate-700',
      ON_HOLD: 'bg-yellow-200 text-yellow-800',
      ON_APPROVAL: 'bg-purple-200 text-purple-800',
      APPROVED: 'bg-teal-200 text-teal-800',
      FULFILLMENT: 'bg-blue-200 text-blue-800',
      DONE: 'bg-green-200 text-green-800',
      REJECTED: 'bg-red-200 text-red-800',
      CANCELLED: 'bg-gray-200 text-gray-700',
    };
    return map[status] ?? 'bg-slate-200 text-slate-700';
  }

}
