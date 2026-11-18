import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
describe('Gemini client', () => {
  it('posts to the same-origin backend without a browser API key', async () => {
    const spy = spyOn(window, 'fetch').and.resolveTo(Response.json({ reply: 'Hello', truncated: false }));
    const reply = await TestBed.inject(ChatService).send([{ role: 'user', text: 'Hi' }], [], new AbortController().signal);
    expect(reply.reply).toBe('Hello'); expect(spy.calls.mostRecent().args[0]).toBe('/api/chat');
    expect(spy.calls.mostRecent().args[1]?.headers).toEqual({ 'Content-Type': 'application/json' });
  });
  it('surfaces backend failures instead of substituting a canned answer', async () => {
    spyOn(window, 'fetch').and.resolveTo(Response.json({ error: 'AI chat is not connected yet.' }, { status: 503 }));
    await expectAsync(TestBed.inject(ChatService).send([{ role: 'user', text: 'Hi' }], [], new AbortController().signal)).toBeRejectedWithError('AI chat is not connected yet.');
  });
});
