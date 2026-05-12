import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Project {
  id: string;
  projectCode: string | null;
  projectName: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    companyName: string;
    referralEmail: string;
  };
  users?: {
    id: string;
    userCode: string;
    name: string;
    email: string;
  }[];
  tickets?: {
    id: string;
    ticketCode: string;
    ticketName: string;
    status: string;
  }[];
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

  getProjectByCode(code: string) {
    return this.http.get<Project>(`/api/projects/${code}`, {
      withCredentials: true,
    });
  }

  createProject(payload: CreateProjectPayload) {
    return this.http.post<Project>('/api/projects', payload, {
      withCredentials: true,
    });
  }

  updateProject(code: string, payload: UpdateProjectPayload) {
    return this.http.patch<Project>(`/api/projects/${code}`, payload, {
      withCredentials: true,
    });
  }

  deleteProject(code: string) {
    return this.http.delete<void>(`/api/projects/${code}`, {
      withCredentials: true,
    });
  }
}
