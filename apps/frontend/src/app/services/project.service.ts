import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Project {
  id: string;
  projectName: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  getProjects(page = 1, amount = 20) {
    return this.http.get<Project[]>('/api/projects', {
      params: { page, amount },
      withCredentials: true,
    });
  }

  getProjectById(id: string) {
    return this.http.get<Project>(`/api/projects/${id}`, {
      withCredentials: true,
    });
  }
}
