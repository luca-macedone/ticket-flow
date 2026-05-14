import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

export interface AdminLog {
  id: string;
  action: string;
  targetType: string;
  targetCode: string | null;
  targetLabel: string | null;
  createdAt: string;
  actor: { userCode: string | null; name: string };
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  stack: string | null;
  context: Record<string, unknown> | null;
  createdAt: string;
}

export interface OverviewData {
  tickets: {
    open: number;
    resolved: number;
    avgResolutionHours: number;
  };
  traffic: { date: string; count: number }[];
  agentWorkload: { agentId: string; agentName: string; open: number }[];
  byCategory: { category: string; count: number }[];
  byProject: { projectId: string; projectName: string; count: number }[];
  byCompany: { companyName: string; count: number }[];
  pendingCount: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  readonly pendingCount = signal(0);

  setPendingCount(n: number) { this.pendingCount.set(n); }
  decrementPending() { this.pendingCount.update(n => Math.max(0, n - 1)); }

  getOverview() {
    return this.http.get<OverviewData>('/api/admin/overview', {
      withCredentials: true,
    });
  }

  getAdminLogs(page = 1, amount = 50, targetType?: string) {
    const params: Record<string, string | number> = { page, amount };
    if (targetType) params['targetType'] = targetType;
    return this.http.get<{ data: AdminLog[]; total: number; page: number }>(
      '/api/admin/logs/admin',
      { withCredentials: true, params }
    );
  }

  getSystemLogs(page = 1, amount = 50, level?: string) {
    const params: Record<string, string | number> = { page, amount };
    if (level) params['level'] = level;
    return this.http.get<{ data: SystemLog[]; total: number; page: number }>(
      '/api/admin/logs/system',
      { withCredentials: true, params }
    );
  }

  changeUserStatus(code: string, status: 'REJECTED' | 'SUSPENDED' | 'APPROVED') {
    return this.http.patch<void>(
      `/api/admin/users/${code}/status`,
      { status },
      { withCredentials: true }
    );
  }

}
