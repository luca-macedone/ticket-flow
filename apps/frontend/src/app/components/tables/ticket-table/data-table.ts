import { Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

export interface TableColumn<T> {
  key: string;
  label: string;
  cellClass?: string;
  getValue: (row: T) => string;
  badgeClass?: (value: string) => string;
}

@Component({
  selector: 'app-data-table',
  imports: [NgClass],
  templateUrl: './data-table.html',
})
export class DataTable<T extends { id: string }> {
  columns = input.required<TableColumn<T>[]>();
  rows = input<T[]>([]);
  total = input(0);
  page = input(1);
  pageSize = input(10);
  emptyMessage = input('No data found.');

  pageChange = output<number>();
  rowClick = output<T>();

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  rangeStart = computed(() => Math.min((this.page() - 1) * this.pageSize() + 1, this.total()));
  rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  cellValue(row: T, col: TableColumn<T>): string {
    return col.getValue(row);
  }
}
