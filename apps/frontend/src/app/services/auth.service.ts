import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, shareReplay, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthUser {
  email: string;
  name: string;
  role: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly user = signal<AuthUser | null>(null);
  private refreshInProgress$: Observable<void> | null = null;

  login(email: string, password: string, rememberMe: boolean = false) {
    return this.http.post<AuthUser>('/api/auth/login', { email, password, rememberMe },
      { withCredentials: true }
    ).pipe(tap(u => this.user.set(u)));
  }

  register(name: string, email: string, password: string, role: string) {
    return this.http.post<{ id: string }>('/api/users/register', { email, password, name, role });
  }

  refresh() {
    if (!this.refreshInProgress$) {
      this.refreshInProgress$ = this.http.post<void>('/api/auth/refresh', {},
        { withCredentials: true }
      ).pipe(
        finalize(() => { this.refreshInProgress$ = null; }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.refreshInProgress$;
  }

  me() {
    return this.http.get<AuthUser>('/api/auth/me',
      { withCredentials: true }
    ).pipe(tap(u => this.user.set(u)));
  }

  logout(reason?: string) {
    return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.user.set(null);
        const onHome = this.router.url === '/' || this.router.url.startsWith('/?');
        if (!onHome) {
          this.router.navigate(['/'], reason ? { queryParams: { reason } } : {});
        }
      })
    );
  }
}
