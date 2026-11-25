import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => service.clear());

  it('adds a success message', () => {
    service.success('Profile saved');
    expect(service.items().length).toBe(1);
    expect(service.items()[0].kind).toBe('success');
    expect(service.items()[0].message).toBe('Profile saved');
  });

  it('ignores blank messages', () => {
    service.error('   ');
    expect(service.items().length).toBe(0);
  });

  it('does not duplicate an identical visible message', () => {
    service.error('Server error');
    service.error('Server error');
    expect(service.items().length).toBe(1);
  });

  it('dismisses a message by id', () => {
    service.info('Hello');
    service.dismiss(service.items()[0].id);
    expect(service.items().length).toBe(0);
  });

  it('keeps at most four messages and drops the oldest', () => {
    for (let i = 1; i <= 5; i++) service.info('Message ' + i);
    expect(service.items().length).toBe(4);
    expect(service.items()[0].message).toBe('Message 2');
  });

  it('removes a message automatically after its duration', fakeAsync(() => {
    service.success('Saved', 1000);
    expect(service.items().length).toBe(1);
    tick(1000);
    expect(service.items().length).toBe(0);
  }));
});