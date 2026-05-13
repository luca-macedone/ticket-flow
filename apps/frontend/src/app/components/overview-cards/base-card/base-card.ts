import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { SkeletonBlock } from '../../skeleton/skeleton-block/skeleton-block';

@Component({
  selector: 'app-base-card',
  imports: [NgClass, SkeletonBlock],
  templateUrl: './base-card.html',
  styleUrl: './base-card.css',
})
export class BaseCard {
  title = input<string>();
  description = input<string>();
  variant = input<'default' | 'opposite' | 'negative'>('default');

  loading = input<boolean>(false);
  skeletonLines = input<number>(3);
  skeletonVariant = input<'pills' | 'lines'>('lines');

  skeletonLineRange = computed(() => Array.from({ length: this.skeletonLines() }, (_, i) => i));
}
