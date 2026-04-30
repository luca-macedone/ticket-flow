import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

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
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getOverview() {
    return this.http.get<OverviewData>('/api/admin/overview', {
      withCredentials: true,
    });
  }
}
