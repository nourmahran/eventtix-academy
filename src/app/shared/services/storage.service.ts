import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  // ---------- localStorage (persists after the browser closes) ----------
  setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('localStorage write failed', e);
    }
  }

  getLocal<T>(key: string): T | null {
    return this.read<T>(localStorage, key);
  }

  removeLocal(key: string): void {
    localStorage.removeItem(key);
  }

  // ---------- sessionStorage (cleared when the tab closes) ----------
  setSession<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('sessionStorage write failed', e);
    }
  }

  getSession<T>(key: string): T | null {
    return this.read<T>(sessionStorage, key);
  }

  removeSession(key: string): void {
    sessionStorage.removeItem(key);
  }

  // ---------- Cookies ----------
  setCookie(name: string, value: string, days = 7): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie =
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  getCookie(name: string): string | null {
    const target = encodeURIComponent(name) + '=';
    const match = document.cookie.split('; ').find(c => c.startsWith(target));
    return match ? decodeURIComponent(match.substring(target.length)) : null;
  }

  deleteCookie(name: string): void {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  // ---------- helper ----------
  private read<T>(store: Storage, key: string): T | null {
    const raw = store.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}