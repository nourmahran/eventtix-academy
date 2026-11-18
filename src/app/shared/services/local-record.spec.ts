import { LocalRecord, money } from './local-record';
describe('Persistent local document', () => {
  const key = 'eventtix.test-record';
  afterEach(() => localStorage.removeItem(key));
  it('reloads committed data and rejects stale writes', () => {
    const first = new LocalRecord(key, { amount: 0 }, x => x && money(x.amount));
    const stale = new LocalRecord(key, { amount: 0 }, x => x && money(x.amount));
    first.save({ amount: 12 });
    expect(new LocalRecord(key, { amount: 0 }, x => x && money(x.amount)).value.amount).toBe(12);
    expect(() => stale.save({ amount: 99 })).toThrowError(/another tab/);
  });
  it('preserves damaged data and refuses to overwrite it', () => {
    localStorage.setItem(key, '{broken');
    const record = new LocalRecord(key, [], Array.isArray);
    expect(record.error).toBeTruthy();
    expect(() => record.save([])).toThrowError();
    expect(localStorage.getItem(key)).toBe('{broken');
  });
  it('keeps the last saved state when browser storage is full', () => {
    const record = new LocalRecord(key, { amount: 0 }, x => x && money(x.amount));
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');
    expect(() => record.save({ amount: 10 })).toThrowError(/Unable to save/);
    expect(record.value.amount).toBe(0);
  });
});
