import { Component } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-breadcrump',
  imports: [RouterLink],
  templateUrl: './breadcrump.html',
  styleUrl: './breadcrump.css',
})
export class Breadcrump {
  constructor(public breadcrumbService: BreadcrumbService) { }
}
