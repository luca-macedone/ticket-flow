import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginResponseSchema, z } from '@packages/shared';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient)

  login(email: string, password: string) {
    return this.http.post<z.infer<typeof LoginResponseSchema>>("/api/auth/login", { email, password });
  }
}
