import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthUser {
  name: string;
  role: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly user = signal<AuthUser | null>(null);

  login(email: string, password: string) {
    return this.http.post<AuthUser>('/api/auth/login', { email, password },
      { withCredentials: true }
    ).pipe(tap(u => this.user.set(u)));
  }

  register(name: string, email: string, password: string, role: string) {
    return this.http.post<{ id: string }>('/api/users/register', { email, password, name, role });
  }

  refresh() {
    return this.http.post<{ ok: boolean }>('/api/auth/refresh', {},
      { withCredentials: true }
    );
  }

  me() {
    return this.http.get<AuthUser>('/api/auth/me',
      { withCredentials: true }
    ).pipe(tap(u => this.user.set(u)));
  }

  logout() {
    return this.http.post('/api/auth/logout', {},
      { withCredentials: true }
    ).pipe(tap(() => {
      this.user.set(null);
      this.router.navigate(['/']);
    }));
  }
}
