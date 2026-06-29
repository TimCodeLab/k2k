export function formatKHR(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(amount)) + ' ៛';
}

// Lightweight QR rendering via a public image service (no extra dependency).
export function khqrImageUrl(payload: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}`;
}
