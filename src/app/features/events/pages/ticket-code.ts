import { Component, Input, OnChanges } from '@angular/core';
import { SavedTicket } from '../services/booking-storage';
import { ticketQr, downloadInvoice } from '../services/ticket-document';
@Component({
  selector: 'app-ticket-code',
  template: `<div class="ticket-document">@if (qr) { <img [src]="qr" alt="Scannable ticket QR code" width="240" height="240" /> }
    <p>Scan for the booking reference. Demo tickets are not valid for admission.</p>
    <button type="button" (click)="download()" [disabled]="busy">{{ busy ? 'Preparing invoice…' : 'Download invoice' }}</button>
    @if (error) { <p role="alert">{{ error }}</p> }</div>`,
  styles: [`.ticket-document{text-align:center;padding:16px 0}.ticket-document img{background:white;border-radius:8px}.ticket-document p{font-size:12px;color:var(--muted)}button{background:var(--primary);color:white;border:0;border-radius:9px;padding:12px 20px;cursor:pointer}button:disabled{opacity:.45}`]
})
export class TicketCode implements OnChanges {
  @Input({ required: true }) ticket!: SavedTicket;
  qr = ''; error = ''; busy = false;
  async ngOnChanges(): Promise<void> {
    const ticket = this.ticket; this.qr = ''; this.error = '';
    try { const qr = await ticketQr(ticket); if (this.ticket === ticket) this.qr = qr; }
    catch { this.error = 'QR could not be generated. Your ticket is still saved.'; }
  }
  async download(): Promise<void> {
    this.busy = true; this.error = '';
    try { await downloadInvoice(this.ticket); }
    catch { this.error = 'Invoice could not be generated. Please try again.'; }
    finally { this.busy = false; }
  }
}
