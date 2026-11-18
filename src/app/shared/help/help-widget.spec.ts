import { TestBed } from '@angular/core/testing';
import { HelpWidget } from './help-widget';
import { ChatService } from './chat.service';
import { AuthService } from '../../core/auth/auth.service';
describe('Gemini conversation UI', () => {
  let chat: jasmine.SpyObj<ChatService>;
  beforeEach(() => {
    chat = jasmine.createSpyObj('ChatService', ['send']);
    chat.send.and.resolveTo({ reply: 'I can help you compare events.', truncated: false });
    TestBed.configureTestingModule({ imports: [HelpWidget], providers: [{ provide: ChatService, useValue: chat }] });
  });
  it('keeps conversation history and only sends public event fields', async () => {
    const widget = TestBed.createComponent(HelpWidget).componentInstance;
    await widget.send('I like music'); await widget.send('Which event would suit me?');
    const [history, events] = chat.send.calls.mostRecent().args;
    expect(history.map(m => m.role)).toEqual(['user', 'model', 'user']);
    expect(history[0].text).toBe('I like music');
    expect(Object.keys(events[0]).sort()).toEqual(['id','title','category','date','location','price','description'].sort());
  });
  it('shows failures and retries without duplicating the user message', async () => {
    chat.send.and.rejectWith(new Error('Gemini usage limit reached.'));
    const widget = TestBed.createComponent(HelpWidget).componentInstance;
    await widget.send('Hello'); expect(widget.error).toContain('usage limit'); expect(widget.messages.length).toBe(1);
    chat.send.and.resolveTo({ reply: 'Hello!', truncated: false });
    await widget.retry(); expect(widget.messages.length).toBe(2); expect(widget.error).toBe('');
  });
  it('stops pending requests and ignores late replies after a new chat', async () => {
    let resolve!: (reply: { reply: string; truncated: boolean }) => void;
    chat.send.and.returnValue(new Promise(r => resolve = r));
    const widget = TestBed.createComponent(HelpWidget).componentInstance;
    const pending = widget.send('Hello'); const signal = chat.send.calls.mostRecent().args[2];
    widget.clear(); expect(signal.aborted).toBeTrue(); resolve({ reply: 'Old reply', truncated: false }); await pending;
    expect(widget.messages).toEqual([]); expect(widget.busy).toBeFalse();
  });
  it('renders model text without interpreting HTML', async () => {
    chat.send.and.resolveTo({ reply: '<img src=x onerror=alert(1)>', truncated: false });
    const fixture = TestBed.createComponent(HelpWidget); await fixture.componentInstance.send('Hello'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('article img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.assistant-message').textContent).toContain('<img');
  });
  it('clears previous chat when the account changes', async () => {
    const fixture = TestBed.createComponent(HelpWidget); fixture.detectChanges();
    await fixture.componentInstance.send('Hello'); TestBed.inject(AuthService).startDemo('student'); fixture.detectChanges();
    expect(fixture.componentInstance.messages).toEqual([]);
  });
});
