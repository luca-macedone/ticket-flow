import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN';
export type UserStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  projects?: { id: string; projectName: string }[];
  assignedTickets?: { id: string; ticketName: string; status: string }[];
  reportedTickets?: { id: string; ticketName: string; status: string }[];
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  email?: string;
  name?: string;
  role?: UserRole;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(page = 1, amount = 20) {
    return this.http.get<AdminUser[]>('/api/users', {
      params: { page, amount },
      withCredentials: true,
    });
  }

  getUserById(id: string) {
    return this.http.get<AdminUser>(`/api/users/${id}`, {
      withCredentials: true,
    });
  }

  createUser(payload: CreateUserPayload) {
    return this.http.post<AdminUser>('/api/users', payload, {
      withCredentials: true,
    });
  }

  updateUser(id: string, payload: UpdateUserPayload) {
    return this.http.patch<AdminUser>(`/api/users/${id}`, payload, {
      withCredentials: true,
    });
  }

  deleteUser(id: string) {
    return this.http.delete<void>(`/api/users/${id}`, {
      withCredentials: true,
    });
  }

  approveUser(id: string, role?: UserRole) {
    return this.http.patch<AdminUser>(
      `/api/admin/users/${id}/approve`,
      role ? { role } : {},
      { withCredentials: true }
    );
  }
}
