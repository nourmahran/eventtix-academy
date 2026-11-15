import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and read an object from localStorage', () => {
    service.setLocal('user', { name: 'Sara', role: 'student' });
    expect(service.getLocal<{ name: string; role: string }>('user'))
      .toEqual({ name: 'Sara', role: 'student' });
  });

  it('should return null for a missing key', () => {
    expect(service.getLocal('missing')).toBeNull();
  });

  it('should remove a value from sessionStorage', () => {
    service.setSession('token', 'abc');
    service.removeSession('token');
    expect(service.getSession('token')).toBeNull();
  });

  it('should set, read and delete a cookie', () => {
    service.setCookie('theme', 'dark', 1);
    expect(service.getCookie('theme')).toBe('dark');
    service.deleteCookie('theme');
    expect(service.getCookie('theme')).toBeNull();
  });
});