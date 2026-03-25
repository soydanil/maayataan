import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const BASE = 'https://maayataan.org';

const QR_ITEMS = [
  { url: BASE, label: 'Contribuye al corpus' },
  { url: `${BASE}/hablantes`, label: 'Únete como hablante' },
  { url: `${BASE}/aliados`, label: 'Únete como aliado' },
];

export default function SlideQR() {
  const refs = [
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
  ];

  useEffect(() => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const dark = isDark ? '#F5EDE0' : '#1A1A18';
    const light = isDark ? '#1A1A18' : '#F5EDE0';
    const size = window.innerWidth >= 768 ? 120 : 96;

    QR_ITEMS.forEach((item, i) => {
      const canvas = refs[i].current;
      if (!canvas) return;
      QRCode.toCanvas(canvas, item.url, {
        width: size,
        margin: 1,
        color: { dark, light },
      });
    });
  }, []);

  return (
    <div className="slide-qr-row">
      {QR_ITEMS.map((item, i) => (
        <div key={item.url} className="slide-qr-item">
          <canvas ref={refs[i]} />
          <span className="slide-qr-label">{item.label}</span>
        </div>
      ))}
      <style>{`
        .slide-qr-row {
          display: flex;
          gap: 24px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .slide-qr-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .slide-qr-item canvas {
          border-radius: 6px;
        }
        .slide-qr-label {
          font-family: var(--font-body);
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          max-width: 120px;
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
}
