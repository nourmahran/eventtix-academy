import { SavedTicket } from './booking-storage';
import { toDataURL } from 'qrcode';

export function qrPayload(ticket: SavedTicket): string {
  return JSON.stringify({ type: 'EventTix demo ticket', reference: ticket.ticketCode, eventId: ticket.eventId, seats: ticket.selectedSeats });
}
export function ticketQr(ticket: SavedTicket): Promise<string> {
  return toDataURL(qrPayload(ticket), { width: 280, margin: 4, errorCorrectionLevel: 'M' });
}
const escapeHtml = (s: unknown): string => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export function invoiceHtml(ticket: SavedTicket, qr: string): string {
  const e = escapeHtml;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invoice ${e(ticket.ticketCode)}</title>
  <style>body{font:16px/1.6 system-ui;color:#242037;margin:40px auto;padding:24px;max-width:760px}h1{color:#6534b5}table{width:100%;border-collapse:collapse}th,td{padding:12px;border-bottom:1px solid #ddd;text-align:left}img{width:240px}small{color:#625c76}@media print{body{margin:0}}</style></head><body>
  <h1>EventTix Academy</h1><h2>Ticket invoice</h2><p>Invoice: ${e(ticket.ticketCode)}<br>Issued: ${e(ticket.bookedAt ?? 'Legacy booking — issue date unavailable')}<br>Customer: ${e(ticket.buyerName ?? 'Account holder')}</p>
  <h3>${e(ticket.eventTitle)}</h3><p>${e(ticket.eventDate)} · ${e(ticket.eventLocation)}</p>
  <table><tr><th>Description</th><th>Amount (EGP)</th></tr><tr><td>Seats ${e(ticket.selectedSeats.join(', '))}</td><td>${ticket.totalPrice.toFixed(2)}</td></tr><tr><td>Student discount</td><td>−${ticket.discountAmount.toFixed(2)}</td></tr><tr><th>Total</th><th>${ticket.finalTotal.toFixed(2)}</th></tr></table>
  <p>Status: Confirmed · Mock payment</p><img src="${e(qr)}" alt="Ticket QR code"><p><small>Classroom demo. No real payment or tax invoice. QR contains a booking reference, not proof of admission. Use your browser’s Print command to save as PDF.</small></p></body></html>`;
}
export async function downloadInvoice(ticket: SavedTicket): Promise<void> {
  const html = invoiceHtml(ticket, await ticketQr(ticket));
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url;
  link.download = `invoice-${ticket.ticketCode.replace(/[^a-z0-9-]/gi, '')}.html`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}
