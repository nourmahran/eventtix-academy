import { Component, ElementRef, ViewChild, inject, OnDestroy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../features/events/services/event';
import { AuthService } from '../../core/auth/auth.service';
import { ChatService, ChatMessage } from './chat.service';

@Component({
  selector: 'app-help-widget', imports: [FormsModule],
  templateUrl: './help-widget.html', styleUrl: './help-widget.scss',
})
export class HelpWidget implements OnDestroy {
  private readonly chat = inject(ChatService);
  private readonly catalog = inject(EventService);
  private readonly auth = inject(AuthService);
  @ViewChild('messageLog') private log?: ElementRef<HTMLElement>;
  question = ''; error = ''; busy = false; shortened = false;
  messages: ChatMessage[] = [];
  suggestions = ['Help me choose an event', 'How does the student discount work?', 'Where can I find my invoice?'];
  private request?: AbortController;
  constructor() {
    let previous: string | null | undefined;
    effect(() => {
      const id = this.auth.user()?.id ?? null;
      if (previous !== undefined && previous !== id) this.clear();
      previous = id;
    });
  }
  async send(text = this.question): Promise<void> {
    const value = text.trim(); if (!value || value.length > 2000 || this.busy) return;
    this.question = ''; this.error = ''; this.shortened = false;
    this.messages = [...this.messages, { role: 'user', text: value }];
    await this.requestReply();
  }
  async retry(): Promise<void> {
    if (!this.busy && this.messages.at(-1)?.role === 'user') await this.requestReply();
  }
  private async requestReply(): Promise<void> {
    const request = new AbortController(); this.request = request;
    this.busy = true; this.error = ''; this.scroll();
    try {
      // Only public catalogue fields are attached. No account or storage records are sent.
      const events = this.catalog.error ? [] : this.catalog.getEvents().slice(0, 20).map(e => ({
        id: e.id, title: e.title.slice(0, 200), category: e.category.slice(0, 200), date: e.date.slice(0, 200),
        location: e.location.slice(0, 200), price: e.price, description: e.description.slice(0, 500),
      }));
      let history = this.messages.slice(-9);
      while (history.length > 1 && history.reduce((sum, m) => sum + m.text.length, 0) > 24000) history = history.slice(2);
      const answer = await this.chat.send(history, events, request.signal);
      if (this.request !== request || request.signal.aborted) return;
      this.messages = [...this.messages, { role: 'model' as const, text: answer.reply }].slice(-40);
      this.shortened = answer.truncated;
    } catch (error) {
      if (this.request === request && !request.signal.aborted) this.error = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    } finally {
      if (this.request === request) { this.busy = false; this.request = undefined; this.scroll(); }
    }
  }
  stop(): void {
    this.request?.abort(); this.request = undefined; this.busy = false;
    this.error = 'Response stopped. You can retry your message.';
  }
  clear(): void {
    this.request?.abort(); this.request = undefined; this.busy = false;
    this.messages = []; this.question = ''; this.error = ''; this.shortened = false;
  }
  editFailedMessage(): void {
    const last = this.messages.at(-1);
    if (!this.busy && last?.role === 'user') {
      this.question = last.text; this.messages = this.messages.slice(0, -1); this.error = '';
    }
  }
  get awaitingReply(): boolean { return this.messages.at(-1)?.role === 'user'; }
  private scroll(): void { setTimeout(() => { const el = this.log?.nativeElement; if (el) el.scrollTop = el.scrollHeight; }); }
  ngOnDestroy(): void { this.request?.abort(); }
}
