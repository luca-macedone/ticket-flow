import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginForm } from "../../components/login-form/login-form";
import { RegisterForm } from "../../components/register-form/register-form";
import { NgIcon } from "@ng-icons/core";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule, ReactiveFormsModule, LoginForm, RegisterForm, NgIcon],
  templateUrl: './home.html',
})
export class Home {
  reason: string | null = null;
  isFormVisible = signal<boolean>(false)
  formType = signal<"register" | "login" | "pending">("login")

  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.reason = this.route.snapshot.queryParams['reason'];
    if (this.reason) {
      this.isFormVisible.set(true);
    } else {
      this.auth.me().subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => { }
      });
    }
  }

  toggleForm() {
    this.isFormVisible.set(!this.isFormVisible())
    this.formType.set("login")
  }

  changeForm(type: "register" | "login" | "pending") {
    this.formType.set(type)
  }
}
