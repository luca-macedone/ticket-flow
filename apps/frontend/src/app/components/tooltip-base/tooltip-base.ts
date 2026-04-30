import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-tooltip-base',
  imports: [],
  templateUrl: './tooltip-base.html',
  styleUrl: './tooltip-base.css',
})
export class TooltipBase {
  content = input<string>('');
  position = input<'top' | 'bottom' | 'left' | 'right'>('top');
  variant = input<'default' | 'light'>('default');
  disabled = input<boolean>(false);
  maxWidth = input<string | undefined>(undefined);
  wrapperClass = input<string>('relative inline-flex');

  protected visible = signal(false);

  show() { if (!this.disabled()) this.visible.set(true); }
  hide() { this.visible.set(false); }

  protected tooltipClass = computed(() => {
    const base = 'absolute z-50 px-3 py-1.5 text-xs rounded-full font-body transition-all duration-150 ease-out pointer-events-none';
    const state = this.visible() ? 'opacity-100 scale-100' : 'opacity-0 scale-95';
    const variant = this.variant() === 'light'
      ? 'bg-background border border-secondary/30 text-text shadow-sm'
      : 'bg-text text-background shadow-md';
    const placement: Record<string, string> = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };
    return `${base} ${state} ${variant} ${placement[this.position()]}`
  })

  protected arrowClass = computed(() => {
    const base = 'absolute w-2 h-2 rotate-45';
    const bg = this.variant() === 'light' ? 'bg-background' : 'bg-text';
    const placement: Record<string, string> = {
      top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2',
      left: 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2',
      right: 'right-full top-1/2 -translate-y-1/2 translate-x-1/2',
    };
    return `${base} ${bg} ${placement[this.position()]}`;
  });
}
