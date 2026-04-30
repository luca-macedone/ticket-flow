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

export interface CreateProjectPayload {
  projectName: string;
  startDate: string;
  companyId: string;
  description?: string;
  endDate?: string;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

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

  createProject(payload: CreateProjectPayload) {
    return this.http.post<Project>('/api/projects', payload, {
      withCredentials: true,
    });
  }

  updateProject(id: string, payload: UpdateProjectPayload) {
    return this.http.patch<Project>(`/api/projects/${id}`, payload, {
      withCredentials: true,
    });
  }

  deleteProject(id: string) {
    return this.http.delete<void>(`/api/projects/${id}`, {
      withCredentials: true,
    });
  }
}
