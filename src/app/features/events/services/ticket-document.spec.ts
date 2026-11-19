import { ticketQr, qrPayload, invoiceHtml } from './ticket-document';
import { SavedTicket } from './booking-storage';
import jsQR from 'jsqr';
describe('Ticket documents', () => {
  const ticket: SavedTicket = { eventId: 1, selectedSeats: ['A1'], isStudent: true, totalPrice: 350, discountAmount: 35, finalTotal: 315,
    ticketCode: 'ET-test-reference', eventTitle: '<script>alert(1)</script>', eventDate: '2026-12-15', eventLocation: 'Cairo' };
  it('generates a QR that decodes to the exact ticket reference and seats', async () => {
    const image = new Image(); image.src = await ticketQr(ticket); await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    expect(jsQR(pixels.data, pixels.width, pixels.height)?.data).toBe(qrPayload(ticket));
  });
  it('exports the saved totals and escapes event text', () => {
    const html = invoiceHtml(ticket, 'data:image/png;base64,test');
    expect(html).toContain('315.00'); expect(html).toContain('35.00');
    expect(html).toContain('&lt;script&gt;'); expect(html).not.toContain('<script>');
  });
});
