import { Injectable } from '@angular/core';

export interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

interface Intent {
  keywords: string[];
  reply: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly SYSTEM_PROMPT =
    'You are the helpful assistant for EasyWeb EventTix Academy, a web app for browsing events ' +
    '(concerts, conferences, workshops), booking tickets, and viewing student fees and payments. ' +
    'Keep answers short and friendly. Only help with this app. If you do not know something such ' +
    'as exact prices or dates, say so and point the user to the relevant page.';

  private intents: Intent[] = [
    { keywords: ['event', 'concert', 'conference', 'workshop', 'upcoming'],
      reply: 'You can browse concerts, conferences and workshops on the Events page. Use the search and filters to find one you like.' },
    { keywords: ['ticket', 'book', 'seat', 'reserve', 'checkout'],
      reply: 'To book a ticket, open an event, choose your seat, and go through checkout. Your e-ticket with a QR code will appear in your profile.' },
    { keywords: ['price', 'cost', 'discount', 'student', 'cheap'],
      reply: 'Ticket prices are shown on each event page, and students get a discount when logged in with a student account.' },
    { keywords: ['fee', 'fees', 'invoice', 'tuition', 'course'],
      reply: 'Your course fees and invoices are in the finance section of your account, where you can also see your payment history.' },
    { keywords: ['login', 'log in', 'sign in', 'signup', 'sign up', 'register', 'password'],
      reply: 'Use the Login or Sign up buttons in the navigation bar. New accounts are created as student accounts.' },
    { keywords: ['profile', 'picture', 'photo', 'account'],
      reply: 'Open your Profile page to update your details and profile picture, and to see your ticket history.' },
    { keywords: ['hello', 'hi', 'hey', 'help'],
      reply: 'Hi! I can help with events, tickets, prices, fees and your account. What would you like to know?' },
  ];

  private fallback =
    "Sorry, I didn't understand that. Try asking about events, tickets, prices, fees or your account.";

  // Asks the AI through the dev-server proxy; falls back to built-in answers if that fails
  async getReply(history: ChatMessage[]): Promise<string> {
    const lastQuestion = history[history.length - 1]?.text ?? '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 400,
          messages: [
            { role: 'system', content: this.SYSTEM_PROMPT },
            ...history.slice(-10).map(m => ({
              role: m.from === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          ],
        }),
      });
      if (!res.ok) throw new Error(`AI returned ${res.status}`);
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      if (!reply) throw new Error('Empty reply');
      return reply;
    } catch (e) {
      console.warn('AI unavailable, using built-in answers', e);
      return this.getRuleBasedReply(lastQuestion);
    }
  }

  private getRuleBasedReply(question: string): string {
    const text = question.toLowerCase();
    let best: Intent | null = null;
    let bestScore = 0;
    for (const intent of this.intents) {
      const score = intent.keywords.filter(k => text.includes(k)).length;
      if (score > bestScore) {
        best = intent;
        bestScore = score;
      }
    }
    return best ? best.reply : this.fallback;
  }
}