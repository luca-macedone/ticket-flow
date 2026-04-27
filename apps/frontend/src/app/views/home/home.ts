import { Component, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoginForm } from "../../components/login-form/login-form";
import { RegisterForm } from "../../components/register-form/register-form";
import { NgIcon } from "@ng-icons/core";

@Component({
  selector: 'app-home',
  imports: [FormsModule, ReactiveFormsModule, LoginForm, RegisterForm, NgIcon],
  templateUrl: './home.html',
})
export class Home {
  reason: string | null = null;
  isFormVisible = signal<boolean>(false)
  formType = signal<"register" | "login" | "pending">("login")

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.reason = this.route.snapshot.queryParams['reason']
  }

  toggleForm() {
    this.isFormVisible.set(!this.isFormVisible())
    this.formType.set("login")
  }

  changeForm(type: "register" | "login" | "pending") {
    this.formType.set(type)
  }
}
