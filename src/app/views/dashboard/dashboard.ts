import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from "@angular/router";
import { Breadcrump } from "../../components/breadcrump/breadcrump";
import { UserService } from '../../data/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, Breadcrump, RouterLinkWithHref],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  userName = signal("");

  constructor(private userService: UserService) {
    this.userName.set(userService.getUserName() as string)
  }
}
