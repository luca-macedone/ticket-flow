import { KeyValuePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginSchema } from '@packages/shared';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { InputField } from "../fields/input-field/input-field";
import { CheckboxField } from "../fields/checkbox-field/checkbox-field";

@Component({
	selector: 'app-login-form',
	templateUrl: './login-form.html',
	imports: [ReactiveFormsModule, KeyValuePipe, InputField, CheckboxField]
})
export class LoginForm {
	loginForm = new FormGroup({
		email: new FormControl("", [Validators.required, Validators.email]),
		password: new FormControl("", [Validators.required, Validators.minLength(8)]),
		rememberMe: new FormControl(false),
	})
	errors: Record<string, string[]> = {};
	private auth = inject(AuthService)
	private cdr = inject(ChangeDetectorRef);
	private router = inject(Router);
	@Output() changeView = new EventEmitter<"register" | "login" | "pending">();

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
			return;
		}
		this.errors = {};

		try {
			await firstValueFrom(this.auth.login(result.data.email, result.data.password, result.data.rememberMe));
			this.router.navigate(['/dashboard']);
		} catch (err: any) {
			this.errors = { auth: [err.error?.message ?? 'Login failed'] };
			if (err instanceof HttpErrorResponse && err.status === 403) {
				this.changeView.emit("pending");
				return;
			}
			this.cdr.detectChanges();
		}
	}


	changeForm() {
		this.changeView.emit("register");
	}
}
