import { TestBed } from '@angular/core/testing';
import { ChatbotService } from './chatbot.service';

describe('ChatbotService', () => {
  let service: ChatbotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatbotService);
  });

  it('returns the AI reply when the API responds', async () => {
    spyOn(window, 'fetch').and.resolveTo(
      new Response(JSON.stringify({ choices: [{ message: { content: 'Hello from AI' } }] }), { status: 200 })
    );
    const reply = await service.getReply([{ from: 'user', text: 'hi' }]);
    expect(reply).toBe('Hello from AI');
  });

  it('falls back to built-in answers when the API fails', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('offline'));
    const reply = await service.getReply([{ from: 'user', text: 'how do I book a ticket?' }]);
    expect(reply).toContain('book a ticket');
  });
});