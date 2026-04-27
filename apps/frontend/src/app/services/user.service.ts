import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  getUsers(page = 1, limit = 20) {
    return this.http.get<AdminUser[]>('/api/users', {
      params: { page, limit },
      withCredentials: true,
    })
  }

  approveUser(id: string, role?: string) {
    return this.http.patch<AdminUser>(
      `/api/admin/users/${id}/approve`,
      role ? { role } : {},
      { withCredentials: true }
    );
  }
}
