import { Component, input } from '@angular/core';

@Component({
  selector: 'app-base-card',
  imports: [],
  templateUrl: './base-card.html',
  styleUrl: './base-card.css',
})
export class BaseCard {
  title = input.required<string>();
  description = input<string>();
}
