import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { LocalRecord, money, text } from '../../../shared/services/local-record';
import { SoundService } from '../../../core/preferences/sound.service';
export interface Department { id: string; name: string; transactions: { id: string; type: 'income' | 'expense'; description: string; amount: number }[]; }
export const validDepartments = (value: any): boolean => Array.isArray(value) && value.every(d => d && text(d.id) && text(d.name) && Array.isArray(d.transactions) && d.transactions.every((t: any) => t && text(t.id) && ['income','expense'].includes(t.type) && text(t.description) && money(t.amount) && t.amount > 0));
@Component({ selector: 'app-department-budget', imports: [FormsModule, DecimalPipe], templateUrl: './department-budget.html', styleUrl: './department-budget.scss' })
export class DepartmentBudget implements AfterViewInit, OnDestroy {
  @ViewChild('chart') canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private sound = inject(SoundService);
  private record = new LocalRecord<Department[]>('eventtix.departments.v1', [], validDepartments);
  departments = this.record.value;
  error = this.record.error;
  message = ''; name = ''; selectedId = ''; description = ''; amount: number | null = null;
  type: 'income' | 'expense' = 'income';
  get selected() { return this.departments.find(d => d.id === this.selectedId); }
  total(d: Department, type: string): number { return Math.round(d.transactions.filter(t => t.type === type).reduce((n,t) => n + t.amount, 0) * 100) / 100; }
  private save(next: Department[]): boolean {
    this.message = '';
    try { this.record.save(next); this.departments = next; this.error = ''; this.message = 'Saved successfully.'; this.updateChart(); void this.sound.success(); return true; }
    catch(e) { this.error = e instanceof Error ? e.message : 'Unable to save.'; return false; }
  }
  addDepartment(): void {
    const name = this.name.trim();
    if (!name || name.length > 80 || this.departments.some(d => d.name.toLowerCase() === name.toLowerCase())) { this.error = 'Enter a unique department name (up to 80 characters).'; return; }
    const d: Department = { id: crypto.randomUUID(), name, transactions: [] };
    if(this.save([...this.departments,d])) { this.selectedId = d.id; this.name = ''; }
  }
  addTransaction(): void {
    if (!this.selected || !this.description.trim() || this.description.trim().length > 200 || !money(this.amount) || this.amount <= 0 || this.amount > 1000000000 || Math.round(this.amount * 100) / 100 !== this.amount || !['income','expense'].includes(this.type)) { this.error = 'Choose a department and enter a description and positive amount with up to two decimal places.'; return; }
    const next = structuredClone(this.departments);
    next.find(d=>d.id===this.selectedId)!.transactions.push({id:crypto.randomUUID(), type:this.type, description:this.description.trim(),amount:this.amount});
    if(this.save(next)) { this.description = ''; this.amount = null; }
  }
  ngAfterViewInit(): void {
    this.chart = new Chart(this.canvas.nativeElement,{ type:'bar', data:{labels:[],datasets:[{label:'Income',data:[],backgroundColor:'#087f74'},{label:'Expenses',data:[],backgroundColor:'#b27838'}]},options:{animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : {duration:180},responsive:true,maintainAspectRatio:false,scales:{x:{ticks:{color:getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#526476'},grid:{display:false}},y:{beginAtZero:true,ticks:{color:getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#526476'},grid:{color:getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#cbd5dc'}}},plugins:{legend:{labels:{color:getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#526476'}}}}}); this.updateChart();
  }
  private updateChart(): void { if(this.chart) { this.chart.data.labels=this.departments.map(d=>d.name);this.chart.data.datasets[0].data=this.departments.map(d=>this.total(d,'income'));this.chart.data.datasets[1].data=this.departments.map(d=>this.total(d,'expense'));this.chart.update(); } }
  ngOnDestroy(): void { this.chart?.destroy(); }
}
