import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Breadcrump } from "../../components/breadcrump/breadcrump";

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, Breadcrump],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard { }
