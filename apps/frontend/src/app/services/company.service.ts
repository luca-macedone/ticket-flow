import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Company {
  id: string;
  companyCode: string | null;
  companyName: string;
  nationality: string;
  description: string | null;
  referralEmail: string;
  createdAt: string;
  updatedAt: string;
  projects?: {
    id: string;
    projectCode: string;
    projectName: string;
    startDate: string;
    endDate: string | null;
  }[];
}

export interface CreateCompanyPayload {
  companyName: string;
  nationality: string;
  referralEmail: string;
  description?: string;
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);

  getCompanies(page = 1, amount = 20) {
    return this.http.get<Company[]>('/api/companies', {
      params: { page, amount },
      withCredentials: true,
    });
  }

  getCompanyByCode(code: string) {
    return this.http.get<Company>(`/api/companies/${code}`, {
      withCredentials: true,
    });
  }

  createCompany(payload: CreateCompanyPayload) {
    return this.http.post<Company>('/api/companies', payload, {
      withCredentials: true,
    });
  }

  updateCompany(code: string, payload: UpdateCompanyPayload) {
    return this.http.patch<Company>(`/api/companies/${code}`, payload, {
      withCredentials: true,
    });
  }

  deleteCompany(code: string) {
    return this.http.delete<void>(`/api/companies/${code}`, {
      withCredentials: true,
    });
  }
}
