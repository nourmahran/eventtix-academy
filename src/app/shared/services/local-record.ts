/** A browser document with validation and stale-write protection. Never replaces damaged data. */
export class LocalRecord<T> {
  error = '';
  private raw: string | null = null;
  private saved: T;
  constructor(private key: string, initial: T, private valid: (value: any) => boolean) {
    this.saved = structuredClone(initial);
    try {
      this.raw = localStorage.getItem(key);
      if (this.raw !== null) {
        const value: unknown = JSON.parse(this.raw);
        if (!valid(value)) throw new Error();
        this.saved = value as T;
      }
    } catch { this.error = 'Saved data could not be read. Check browser storage; existing data has not been replaced.'; }
  }
  get value(): T { return structuredClone(this.saved); }
  assertCurrent(): void {
    if (this.error) throw new Error(this.error);
    if (localStorage.getItem(this.key) !== this.raw) throw new Error('Data changed in another tab. Reload this page before saving.');
  }
  save(value: T): void {
    if (this.error) throw new Error(this.error);
    if (!this.valid(value)) throw new Error('Check the entered values before saving.');
    this.assertCurrent();
    const raw = JSON.stringify(value);
    try { localStorage.setItem(this.key, raw); }
    catch { throw new Error('Unable to save. Check browser storage and try again.'); }
    this.raw = raw;
    this.saved = structuredClone(value);
  }
}
export const money = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
export const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
