interface CertificateProps {
  contributorName: string;
  entryNumber: number;
  totalCount: number;
}

export default function Certificate({ contributorName, entryNumber, totalCount }: CertificateProps) {
  return (
    <div className="certificate">
      <div className="cert-accent cert-accent-top" />
      <div className="cert-body">
        <p className="cert-heading-maya">Ma'alob meyaj</p>
        <p className="cert-heading-es">Buen trabajo</p>

        <p className="cert-name">{contributorName}</p>
        <p className="cert-detail">contribuyó al corpus maya</p>
        <p className="cert-entry">
          Entrada #{entryNumber} de {totalCount}
        </p>

        <p className="cert-date">
          {new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <p className="cert-url">maayataan.org</p>
      </div>
      <div className="cert-accent cert-accent-bottom" />

      <style>{`
        .certificate {
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          overflow: hidden;
          background: white;
          max-width: 400px;
          margin: var(--space-4) auto;
        }
        .cert-accent {
          height: 4px;
        }
        .cert-accent-top {
          background: var(--color-primary);
        }
        .cert-accent-bottom {
          background: var(--color-secondary);
        }
        .cert-body {
          padding: var(--space-5) var(--space-4);
          text-align: center;
        }
        .cert-heading-maya {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
        }
        .cert-heading-es {
          font-size: 0.9rem;
          color: var(--color-muted);
          margin-bottom: var(--space-4);
        }
        .cert-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--space-1);
        }
        .cert-detail {
          color: var(--color-muted);
          margin-bottom: var(--space-2);
        }
        .cert-entry {
          font-weight: 600;
          color: var(--color-secondary);
          margin-bottom: var(--space-4);
        }
        .cert-date {
          font-size: 0.85rem;
          color: var(--color-muted);
        }
        .cert-url {
          font-size: 0.85rem;
          color: var(--color-muted);
        }
      `}</style>
    </div>
  );
}
