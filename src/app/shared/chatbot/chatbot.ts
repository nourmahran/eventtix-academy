import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../services/chatbot.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
})
export class Chatbot {
  private chatbot = inject(ChatbotService);
  private storage = inject(StorageService);
  private readonly KEY = 'eventtix.chatHistory.v1';

  @ViewChild('messagesEl') messagesEl?: ElementRef<HTMLDivElement>;

  open = false;
  typing = false;
  input = '';
  messages: ChatMessage[] = this.storage.getSession<ChatMessage[]>(this.KEY) ?? [
    { from: 'bot', text: 'Hi! Ask me about events, tickets, prices or fees.' },
  ];

  toggle(): void {
    this.open = !this.open;
    this.scrollDown();
  }

  async send(): Promise<void> {
    const question = this.input.trim();
    if (!question || this.typing) return;

    this.messages.push({ from: 'user', text: question });
    this.input = '';
    this.typing = true;
    this.save();
    this.scrollDown();

    const reply = await this.chatbot.getReply(this.messages);

    this.typing = false;
    this.messages.push({ from: 'bot', text: reply });
    this.save();
    this.scrollDown();
  }

  private save(): void {
    this.storage.setSession(this.KEY, this.messages);
  }

  private scrollDown(): void {
    setTimeout(() => {
      const el = this.messagesEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}