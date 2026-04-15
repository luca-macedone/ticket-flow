import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User, UserService } from '../../data/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './home.html',
})
export class Home {

  userForm!: FormGroup;
  reason: string | null = null;
  defaultUsers: User[] = [];

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.defaultUsers = this.userService.getUsers();
    this.userForm = this.fb.group({
      selectedUser: [-1]
    });
    this.reason = this.route.snapshot.queryParams['reason']
  }

  async onSubmit() {

    const userId = this.userForm.value.selectedUser;

    if (userId === null) return;

    console.log('form', userId);
    sessionStorage.setItem('userId', String(userId));
    this.router.navigate(['dashboard'])
  }
}
