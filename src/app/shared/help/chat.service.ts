import { Injectable } from '@angular/core';
export interface ChatMessage { role: 'user' | 'model'; text: string; }
export interface ChatEvent { id: number; title: string; category: string; date: string; location: string; price: number; description: string; }
export interface ChatReply { reply: string; truncated: boolean; }

@Injectable({ providedIn: 'root' })
export class ChatService {
  async send(messages: ChatMessage[], events: ChatEvent[], signal: AbortSignal): Promise<ChatReply> {
    let response: Response;
    try {
      response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, events }), signal });
    } catch (error) {
      if (signal.aborted) throw error;
      throw new Error('Chat is offline. Check your connection and try again.');
    }
    let data: any;
    try { data = await response.json(); }
    catch { throw new Error('Chat is unavailable. Start the app with npm start and try again.'); }
    if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Chat is unavailable. Please try again.');
    if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('No reply was received. Please try again.');
    return { reply: data.reply, truncated: data.truncated === true };
  }
}
