import { TestBed } from '@angular/core/testing';
import { FeeLinks } from './fee-links';
import { AuthService, defaultPreferences } from '../../core/auth/auth.service';

describe('Staff-assigned student fee access', () => {
  let auth: AuthService;
  let links: FeeLinks;
  const keys = ['eventtix.accounts.v1', 'eventtix.fees.v1', 'eventtix.fee-links.v1'];
  const data = { username: 'fee_student', fullName: 'Fee Student', email: 'fee@example.test', password: 'Test-password-2026', preferences: defaultPreferences };
  beforeEach(async () => {
    keys.forEach(key => localStorage.removeItem(key));
    auth = TestBed.inject(AuthService); links = TestBed.inject(FeeLinks);
    await auth.signup(data);
    localStorage.setItem('eventtix.fees.v1', JSON.stringify({ students: [
      { id: 'one', name: 'Fee Student', totalFees: 1000, paidAmount: 250, status: 'Partial' },
      { id: 'two', name: 'Other Student', totalFees: 2000, paidAmount: 0, status: 'Unpaid' }
    ] }));
  });
  afterEach(() => { keys.forEach(key => localStorage.removeItem(key)); sessionStorage.removeItem('eventtix.lastUsername'); });
  it('rejects student self-assignment and exposes no unlinked record', () => {
    expect(() => links.link('one', data.username)).toThrowError('Staff access required.');
    expect(links.ownFees()).toBeNull();
  });
  it('persists staff assignment and returns only the signed-in student balance', async () => {
    auth.startDemo('accounting'); links.link('one', data.username);
    await auth.login(data.username, data.password);
    expect(links.ownFees()?.id).toBe('one');
    expect(links.ownFees()?.paidAmount).toBe(250);
    auth.startDemo('student'); expect(links.ownFees()).toBeNull();
  });
  it('rejects duplicate and unknown accounts and supports unlinking', async () => {
    auth.startDemo('admin'); links.link('one', data.username);
    expect(() => links.link('two', data.username)).toThrow();
    expect(() => links.link('two', 'unknown')).toThrow();
    links.link('one', '');
    await auth.login(data.username, data.password); expect(links.ownFees()).toBeNull();
  });
  it('fails closed on corrupted fee data without overwriting it', async () => {
    auth.startDemo('accounting'); links.link('one', data.username);
    localStorage.setItem('eventtix.fees.v1', '{damaged');
    await auth.login(data.username, data.password);
    expect(() => links.ownFees()).toThrow();
    expect(localStorage.getItem('eventtix.fees.v1')).toBe('{damaged');
  });
});
