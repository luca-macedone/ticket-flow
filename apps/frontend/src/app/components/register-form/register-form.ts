import { ChangeDetectorRef, Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CreateUserSchema } from '@packages/shared';
import { firstValueFrom } from 'rxjs';
import { KeyValuePipe } from '@angular/common';
import { Router } from '@angular/router';
import { InputField } from "../fields/input-field/input-field";
import { SelectField } from "../fields/select-field/select-field";

@Component({
	selector: 'app-register-form',
	imports: [ReactiveFormsModule, KeyValuePipe, InputField, SelectField],
	templateUrl: './register-form.html',
})
export class RegisterForm {
	registerForm = new FormGroup({
		email: new FormControl("", [Validators.required, Validators.email]),
		password: new FormControl("", [Validators.required, Validators.minLength(8)]),
		confirmPassword: new FormControl("", [Validators.required, Validators.minLength(8)]),
		name: new FormControl("", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
		role: new FormControl("", [Validators.required])
	})
	errors: Record<string, string[]> = {};
	private auth = inject(AuthService);
	private cdr = inject(ChangeDetectorRef);
	private router = inject(Router);
	@Output() changeView = new EventEmitter<"register" | "login" | "pending">();

	get hasErrors(): boolean {
		return Object.keys(this.errors).length > 0;
	}

	resetForm() {
		this.registerForm.reset();
		this.errors = {}
	}

	async submitRegistration() {
		const result = CreateUserSchema.safeParse(this.registerForm.getRawValue());

		if (!result.success) {
			this.errors = result.error.flatten().fieldErrors as Record<string, string[]>;
			return;
		}

		this.errors = {}

		try {
			await firstValueFrom(this.auth.register(
				result.data.name, result.data.email, result.data.password, result.data.role
			));
			// pending: setta lo stato e naviga alla dashboard bloccata
			this.changeView.emit("pending");
			this.router.navigate(['/dashboard']);
		} catch (err: any) {
			this.errors = {
				auth: [err.error?.message ?? "Registration failed"]
			}
			this.cdr.detectChanges()
		}
	}

	changeForm() {
		this.changeView.emit("login");
	}
}
