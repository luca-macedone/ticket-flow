import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User, UserService } from '../../data/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginForm } from "../../components/login-form/login-form";
import { RegisterForm } from "../../components/register-form/register-form";

@Component({
  selector: 'app-home',
  imports: [FormsModule, ReactiveFormsModule, LoginForm, RegisterForm],
  templateUrl: './home.html',
})
export class Home {
  reason: string | null = null;
  isFormVisible = signal<boolean>(false)
  formType = signal<"register" | "login">("login")

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.reason = this.route.snapshot.queryParams['reason']
  }

  toggleForm() {
    this.isFormVisible.set(!this.isFormVisible())
  }

  changeForm(type: "register" | "login") {
    this.formType.set(type)
  }
}
