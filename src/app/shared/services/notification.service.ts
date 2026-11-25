import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
  id: number;
  kind: NotificationKind;
  message: string;
}

const MAX_VISIBLE = 4;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  /** Messages currently on screen, oldest first. */
  readonly items = signal<AppNotification[]>([]);

  success(message: string, durationMs = 4000): void {
    this.push('success', message, durationMs);
  }

  error(message: string, durationMs = 7000): void {
    this.push('error', message, durationMs);
  }

  warning(message: string, durationMs = 6000): void {
    this.push('warning', message, durationMs);
  }

  info(message: string, durationMs = 5000): void {
    this.push('info', message, durationMs);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) clearTimeout(timer);
    this.timers.delete(id);
    this.items.update(list => list.filter(item => item.id !== id));
  }

  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.items.set([]);
  }

  private push(kind: NotificationKind, message: string, durationMs: number): void {
    const text = message.trim();
    if (!text) return;
    // Do not stack the same message twice while it is still visible.
    if (this.items().some(item => item.kind === kind && item.message === text)) return;

    const id = this.nextId++;
    this.items.update(list => [...list.slice(-(MAX_VISIBLE - 1)), { id, kind, message: text }]);
    if (durationMs > 0) {
      this.timers.set(id, setTimeout(() => this.dismiss(id), durationMs));
    }
  }
}