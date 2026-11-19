import { Injectable, computed, signal } from '@angular/core';
import { SignupData, User, UserPreferences, UserRole, USER_ROLES } from '../models/user.model';
import { validateProfileOptions } from './profile-options';

interface Account { user: User; salt: string; hash: string }
const KEY = 'eventtix.accounts.v1';
/** Per-tab sign-in marker. Holds an account id or a demo role name only, never a password or hash. */
export const SESSION_KEY = 'eventtix.session.v1';
type SessionMarker = { userId: string } | { demoRole: UserRole };
export const defaultPreferences: UserPreferences = { theme: 'dark', notificationsEnabled: true, soundEnabled: false };

// Browser-only classroom demo. No browser value is an authorization boundary.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly current = signal<User | null>(null);
  readonly user = this.current.asReadonly();
  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor() { this.restoreSession(); }

  // Session storage keeps the sign-in for this tab only: it survives a refresh,
  // and is cleared on logout or when the tab closes. Roles are re-derived here,
  // never read from storage (registered accounts are always students; demo roles
  // are already open to anyone through the login page's demo buttons).
  private restoreSession(): void {
    let marker: Partial<{ userId: unknown; demoRole: unknown }> | null = null;
    try { marker = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null'); } catch { marker = null; }
    if (!marker || typeof marker !== 'object') return;
    try {
      if (typeof marker.demoRole === 'string' && (USER_ROLES as readonly string[]).includes(marker.demoRole)) {
        this.startDemo(marker.demoRole as UserRole);
        return;
      }
      const account = typeof marker.userId === 'string' ? this.accounts().find(a => a.user.id === marker!.userId) : undefined;
      if (account) { this.current.set({ ...account.user, role: 'student' }); return; }
    } catch { /* Damaged storage: stay signed out. */ }
    this.clearSession();
  }

  private persistSession(marker: SessionMarker): void {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(marker)); } catch { /* Sign-in still works for this page load. */ }
  }

  private clearSession(): void {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Nothing to clear. */ }
  }

  // Session storage remembers only a convenience field, never a password or role.
  rememberedUsername(): string {
    try { const value = sessionStorage.getItem('eventtix.lastUsername') ?? ''; return /^[a-z0-9_]{3,30}$/.test(value) ? value : ''; }
    catch { return ''; }
  }

  private rememberUsername(username: string): void {
    try { sessionStorage.setItem('eventtix.lastUsername', username); } catch { /* Optional convenience; login still works. */ }
  }

  private accounts(): Account[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      if (!Array.isArray(value) || value.some(a => !a?.user?.id || typeof a.user.username !== 'string' || typeof a.user.email !== 'string' || typeof a.salt !== 'string' || typeof a.hash !== 'string')) throw new Error();
      return value;
    } catch { throw new Error('Account storage is unavailable or damaged. Enable browser storage or clear EventTix site data.'); }
  }

  private save(accounts: Account[]): void {
    try { localStorage.setItem(KEY, JSON.stringify(accounts)); }
    catch { throw new Error('Unable to save your account. Check browser storage and try again.'); }
  }

  private async digest(password: string, salt: string): Promise<string> {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 600000 }, key, 256);
    return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, '0')).join('');
  }

  async signup(data: SignupData): Promise<void> {
    validateProfileOptions(data.preferences, data.profilePictureUrl, data.paymentMethodLabel);
    const username = data.username.trim().toLowerCase();
    const email = data.email.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(username) || data.fullName.trim().length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || data.password.length < 8 || data.password.length > 128) throw new Error('Check your name, username, email and password (8–128 characters).');
    const salt = crypto.randomUUID();
    const hash = await this.digest(data.password, salt);
    const accounts = this.accounts();
    if (accounts.some(a => a.user.username.toLowerCase() === username || a.user.email.toLowerCase() === email)) throw new Error('That username or email is already registered.');
    const user: User = { id: crypto.randomUUID(), username, fullName: data.fullName.trim(), email, role: 'student', preferences: { ...data.preferences }, profilePictureUrl: data.profilePictureUrl || undefined, paymentMethodLabel: data.paymentMethodLabel || undefined, createdAt: new Date().toISOString() };
    this.save([...accounts, { user, salt, hash }]);
    this.current.set(user);
    this.persistSession({ userId: user.id });
    this.rememberUsername(username);
  }

  async login(username: string, password: string): Promise<void> {
    const account = this.accounts().find(a => a.user.username.toLowerCase() === username.trim().toLowerCase());
    if (!account || await this.digest(password, account.salt) !== account.hash) throw new Error('Incorrect username or password.');
    // Stored roles are never trusted: public registration only creates students.
    this.current.set({ ...account.user, role: 'student' });
    this.persistSession({ userId: account.user.id });
    this.rememberUsername(account.user.username);
  }

  startDemo(role: UserRole): void {
    this.current.set({ id: `demo-${role}`, username: `demo-${role}`, fullName: `${role[0].toUpperCase()}${role.slice(1)} Demo`, email: `${role}@example.test`, role, preferences: { ...defaultPreferences }, createdAt: new Date().toISOString() });
    this.persistSession({ demoRole: role });
  }

  studentAccountId(username: string): string {
    if (!this.hasRole(['admin', 'accounting'])) throw new Error('Staff access required.');
    const account = this.accounts().find(a => a.user.username === username.trim().toLowerCase());
    if (!account) throw new Error('Registered student username not found in this browser.');
    return account.user.id;
  }

  logout(): void { this.current.set(null); this.clearSession(); }
  hasRole(roles: readonly UserRole[]): boolean { const user = this.user(); return !!user && roles.includes(user.role); }

  updateProfile(fullName: string, email: string, preferences: UserPreferences, details?: { profilePictureUrl: string; paymentMethodLabel: string }): void {
    const user = this.user();
    if (!user) throw new Error('Please sign in again.');
    validateProfileOptions(preferences, details?.profilePictureUrl ?? user.profilePictureUrl, details?.paymentMethodLabel ?? user.paymentMethodLabel);
    email = email.trim().toLowerCase();
    if (fullName.trim().length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid name and email.');
    const updated = { ...user, ...details, fullName: fullName.trim(), email, preferences: { ...preferences } };
    if (!user.id.startsWith('demo-')) {
      const accounts = this.accounts();
      if (!accounts.some(a => a.user.id === user.id)) throw new Error('Account no longer exists. Please sign in again.');
      if (accounts.some(a => a.user.id !== user.id && a.user.email.toLowerCase() === email)) throw new Error('That email is already registered.');
      this.save(accounts.map(a => a.user.id === user.id ? { ...a, user: updated } : a));
    }
    this.current.set(updated);
  }
}
