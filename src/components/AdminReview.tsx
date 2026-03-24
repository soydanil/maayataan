import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Contribution } from '../lib/database.types';

export default function AdminReview() {
  const [entries, setEntries] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    setLoading(true);
    // Note: this requires the admin to use a service role key or
    // an RLS policy that allows admins to read pending entries.
    // For demo, we add a permissive read policy for authenticated admins.
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data) setEntries(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setUpdating(id);
    const { error } = await supabase
      .from('contributions')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    setUpdating(null);
  }

  if (loading) {
    return <p className="admin-status">Cargando entradas pendientes...</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="admin-empty">
        <p>No hay entradas pendientes de revisión.</p>
      </div>
    );
  }

  return (
    <div className="admin-list">
      <p className="admin-count">{entries.length} entradas pendientes</p>
      {entries.map((entry) => (
        <div key={entry.id} className="review-card">
          <div className="review-content">
            <p className="review-maya">{entry.maya_text}</p>
            <p className="review-es">{entry.spanish_translation}</p>
            <div className="review-meta">
              <span>{entry.contributor_name}</span>
              <span>{entry.dialect}</span>
              <span>{entry.source}</span>
              {entry.audio_url && (
                <audio controls preload="none" src={entry.audio_url}>
                  <track kind="captions" />
                </audio>
              )}
            </div>
          </div>
          <div className="review-actions">
            <button
              type="button"
              className="btn btn-approve"
              disabled={updating === entry.id}
              onClick={() => updateStatus(entry.id, 'approved')}
              aria-label={`Aprobar entrada de ${entry.contributor_name}`}
            >
              Aprobar
            </button>
            <button
              type="button"
              className="btn btn-reject"
              disabled={updating === entry.id}
              onClick={() => updateStatus(entry.id, 'rejected')}
              aria-label={`Rechazar entrada de ${entry.contributor_name}`}
            >
              Rechazar
            </button>
          </div>
        </div>
      ))}

      <style>{`
        .admin-status, .admin-empty {
          text-align: center;
          padding: var(--space-5);
          color: var(--color-muted);
        }
        .admin-count {
          font-weight: 600;
          margin-bottom: var(--space-3);
          color: var(--color-muted);
          font-size: 0.9rem;
        }
        .admin-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .review-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          padding: var(--space-3);
          background: white;
        }
        .review-maya {
          font-weight: 600;
          margin-bottom: var(--space-1);
        }
        .review-es {
          color: var(--color-muted);
          font-size: 0.9rem;
          margin-bottom: var(--space-2);
        }
        .review-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          font-size: 0.8rem;
          color: var(--color-muted);
          margin-bottom: var(--space-3);
        }
        .review-meta audio {
          height: 32px;
        }
        .review-actions {
          display: flex;
          gap: var(--space-2);
        }
        .btn {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          cursor: pointer;
          font-weight: 600;
          min-height: 44px;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-approve {
          background: var(--color-secondary);
          color: white;
          border-color: var(--color-secondary);
        }
        .btn-reject {
          background: white;
          color: var(--color-error);
          border-color: var(--color-error);
        }
      `}</style>
    </div>
  );
}
