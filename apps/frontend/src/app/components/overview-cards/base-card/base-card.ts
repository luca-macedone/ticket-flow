import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-base-card',
  imports: [NgClass],
  templateUrl: './base-card.html',
  styleUrl: './base-card.css',
})
export class BaseCard {
  title = input<string>();
  description = input<string>();
  variant = input<'default' | 'opposite' | 'negative'>('default');
}
