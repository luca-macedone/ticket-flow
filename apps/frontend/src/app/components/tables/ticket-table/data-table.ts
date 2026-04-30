import { Component, computed, effect, input, output, signal, TemplateRef, untracked } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';

export interface TableColumn<T> {
  key: string;
  label: string;
  cellClass?: string;
  sortable?: boolean;
  getValue?: (row: T) => string;
  badgeClass?: (value: string) => string;
  cellTemplate?: TemplateRef<{ $implicit: T; value?: string }>;
}

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  imports: [NgClass, NgTemplateOutlet],
  templateUrl: './data-table.html',
})
export class DataTable<T extends { id: string }> {
  columns = input.required<TableColumn<T>[]>();
  rows = input<T[]>([]);
  total = input(0);
  page = input(1);
  pageSize = input(10);
  emptyMessage = input('No data found.');
  hideable = input(false);
  reorderable = input(false);

  pageChange = output<number>();
  rowClick = output<T>();
  sortChange = output<SortState | null>();

  sortState = signal<SortState | null>(null);
  hiddenKeys = signal<Set<string>>(new Set());
  columnOrder = signal<TableColumn<T>[]>([]);
  showColumnPanel = signal(false);

  visibleColumns = computed(() => {
    const hidden = this.hiddenKeys();
    return this.columnOrder().filter(c => !hidden.has(c.key));
  });

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  rangeStart = computed(() => Math.min((this.page() - 1) * this.pageSize() + 1, this.total()));
  rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  private dragSourceIdx: number | null = null;

  constructor() {
    effect(() => {
      const newCols = this.columns();
      const currentKeys = untracked(() => this.columnOrder().map(c => c.key).join(','));
      if (newCols.map(c => c.key).join(',') !== currentKeys) {
        this.columnOrder.set([...newCols]);
        this.hiddenKeys.set(new Set());
      }
    }, { allowSignalWrites: true })
  }

  cellValue(row: T, col: TableColumn<T>): string {
    return col.getValue ? col.getValue(row) : '';
  }

  toggleSort(col: TableColumn<T>): void {
    if (!col.sortable) return;
    const curr = this.sortState();
    let next: SortState | null;
    if (!curr || curr.key !== col.key) next = { key: col.key, dir: 'asc' };
    else if (curr.dir === 'asc') next = { key: col.key, dir: 'desc' };
    else next = null;
    this.sortState.set(next);
    this.sortChange.emit(next);
  }

  toggleColumn(key: string): void {
    const hidden = new Set(this.hiddenKeys());
    hidden.has(key) ? hidden.delete(key) : hidden.add(key);
    this.hiddenKeys.set(hidden)
  }

  isHidden(key: string): boolean {
    return this.hiddenKeys().has(key);
  }

  onDragStart(idx: number): void { this.dragSourceIdx = idx; }

  onDragEnter(targetIdx: number): void {
    if (this.dragSourceIdx === null || this.dragSourceIdx === targetIdx) return;
    const visible = this.visibleColumns();
    const cols = [...this.columnOrder()];
    const srcKey = visible[this.dragSourceIdx].key;
    const tgtKey = visible[targetIdx].key;
    const srcI = cols.findIndex(c => c.key === srcKey);
    const [moved] = cols.splice(srcI, 1);
    const tgtI = cols.findIndex(c => c.key === tgtKey);
    cols.splice(tgtI, 0, moved);
    this.dragSourceIdx = targetIdx;
    this.columnOrder.set(cols);
  }

  onDragEnd(): void { this.dragSourceIdx = null; }
}
