import { KeyValuePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginSchema } from '@packages/shared';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.html',
  imports: [ReactiveFormsModule, KeyValuePipe]
})
export class LoginForm {
  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(8)]),
  })
  errors: Record<string, string[]> = {};
  private auth = inject(AuthService)
  private cdr = inject(ChangeDetectorRef);

  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  resetForm() {
    this.loginForm.reset()
    this.errors = {}
  }
  async submitLogin() {
    const result = LoginSchema.safeParse(this.loginForm.getRawValue());

    if (!result.success) {
      this.errors = result.error.flatten().fieldErrors as Record<string, string[]>;
      console.log("invalid")
      return;
    }

    this.errors = {}

    try {
      const response = await firstValueFrom(this.auth.login(
        result.data.email,
        result.data.password
      ))
    } catch (err: any) {
      this.errors = {
        auth: [err.error?.message ?? "Login failed"]
      }
      this.cdr.detectChanges()
    }
  }
}
