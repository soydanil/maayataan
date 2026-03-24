import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

const SITE_URL = 'https://maayataan.org';

export default function QRPoster() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    generatePoster();
  }, []);

  async function generatePoster() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 612; // Letter width in px at 72dpi
    const h = 792; // Letter height

    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = '#FAF3E8';
    ctx.fillRect(0, 0, w, h);

    // Top accent
    ctx.fillStyle = '#B85C38';
    ctx.fillRect(0, 0, w, 6);

    // Title (Maya)
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("KO'OX KANIK MAAYA", w / 2, 100);

    // Subtitle (Spanish)
    ctx.fillStyle = '#8B7355';
    ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Aprendamos maya', w / 2, 135);

    // QR code
    const qrSize = 280;
    const qrX = (w - qrSize) / 2;
    const qrY = 180;

    try {
      const qrDataUrl = await QRCode.toDataURL(SITE_URL, {
        width: qrSize,
        margin: 2,
        color: { dark: '#1A1A1A', light: '#FAF3E8' },
      });
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        finishPoster(ctx, w, h, qrY + qrSize);
        setGenerated(true);
      };
      img.src = qrDataUrl;
    } catch {
      finishPoster(ctx, w, h, qrY + qrSize);
      setGenerated(true);
    }
  }

  function finishPoster(ctx: CanvasRenderingContext2D, w: number, h: number, y: number) {
    // CTA lines
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Ts'aik a t'aan.", w / 2, y + 50);

    ctx.fillStyle = '#8B7355';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Comparte tu voz.', w / 2, y + 80);

    // URL
    ctx.fillStyle = '#B85C38';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('maayataan.org', w / 2, y + 130);

    // Bottom accent
    ctx.fillStyle = '#2D6A4F';
    ctx.fillRect(0, h - 6, w, 6);
  }

  function downloadPoster() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'maayataan-poster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="qr-poster">
      <canvas ref={canvasRef} className="poster-canvas" />
      {generated && (
        <button type="button" className="btn btn-primary" onClick={downloadPoster}>
          Descargar póster
        </button>
      )}
      <style>{`
        .qr-poster {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
        }
        .poster-canvas {
          max-width: 100%;
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
        }
        .btn {
          padding: var(--space-3) var(--space-5);
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          font-weight: 600;
          min-height: 44px;
        }
        .btn-primary {
          background: var(--color-primary);
          color: white;
        }
      `}</style>
    </div>
  );
}
