import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { LocalRecord, money, text } from '../../shared/services/local-record';

interface FeeSummary { id: string; name: string; totalFees: number; paidAmount: number; status: string }
@Injectable({ providedIn: 'root' })
export class FeeLinks {
  private readonly auth = inject(AuthService);
  private records() {
    return new LocalRecord<Record<string, string>>('eventtix.fee-links.v1', {}, value =>
      value && typeof value === 'object' && !Array.isArray(value) &&
      Object.values(value).every(text) && new Set(Object.values(value)).size === Object.values(value).length);
  }
  link(studentId: string, username: string): void {
    if (!this.auth.hasRole(['admin', 'accounting'])) throw new Error('Staff access required.');
    const record = this.records();
    const links = record.value;
    if (username.trim()) {
      const accountId = this.auth.studentAccountId(username);
      if (Object.entries(links).some(([id, account]) => id !== studentId && account === accountId)) {
        throw new Error('This account is already linked to another student record. Unlink it first.');
      }
      links[studentId] = accountId;
    } else { delete links[studentId]; }
    record.save(links);
  }
  isLinked(studentId: string): boolean {
    if (!this.auth.hasRole(['admin', 'accounting'])) return false;
    const record = this.records();
    if (record.error) throw new Error(record.error);
    return Object.hasOwn(record.value, studentId);
  }
  ownFees(): FeeSummary | null {
    const user = this.auth.user();
    if (!user || user.role !== 'student') return null;
    const record = this.records();
    if (record.error) throw new Error(record.error);
    const ids = Object.entries(record.value).filter(([, account]) => account === user.id).map(([id]) => id);
    if (!ids.length) return null;
    const data = JSON.parse(localStorage.getItem('eventtix.fees.v1') ?? 'null');
    if (!data || !Array.isArray(data.students)) throw new Error('Fee records are unavailable. Contact accounting.');
    const rows = data.students.filter((s: FeeSummary) => s && ids.includes(s.id));
    if (rows.length !== 1 || !text(rows[0].name) || !money(rows[0].totalFees) || !money(rows[0].paidAmount) || rows[0].paidAmount > rows[0].totalFees || !['Paid', 'Partial', 'Unpaid'].includes(rows[0].status)) {
      throw new Error('Your fee record could not be read. Contact accounting.');
    }
    const { id, name, totalFees, paidAmount, status } = rows[0];
    return { id, name, totalFees, paidAmount, status };
  }
}
