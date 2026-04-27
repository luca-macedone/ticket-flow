import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Company {
  id: string;
  companyName: string;
  nationality: string;
  description: string | null;
  referralEmail: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);

  getCompanies(page = 1, amount = 20) {
    return this.http.get<Company[]>('/api/companies', {
      params: { page, amount },
      withCredentials: true,
    });
  }

  getCompanyById(id: string) {
    return this.http.get<Company>(`/api/companies/${id}`, {
      withCredentials: true,
    });
  }
}
