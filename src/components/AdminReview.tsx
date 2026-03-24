import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Contribution } from '../lib/database.types';
import type { Session } from '@supabase/supabase-js';

export default function AdminReview() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [entries, setEntries] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthLoading(false);
      if (s) loadPending();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) loadPending();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setEntries([]);
  }

  async function loadPending() {
    setLoading(true);
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

  if (authLoading) {
    return <p className="admin-status">Cargando...</p>;
  }

  if (!session) {
    return (
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-field">
          <label htmlFor="admin-email">Correo electrónico</label>
          <input
            type="email"
            id="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="admin-password">Contraseña</label>
          <input
            type="password"
            id="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {authError && <p className="form-error" role="alert">{authError}</p>}
        <button type="submit" className="btn btn-primary">Iniciar sesión</button>

        <style>{`
          .login-form {
            max-width: 360px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: var(--space-3);
          }
          .form-field {
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
          }
          .form-field label {
            font-weight: 600;
            font-size: 0.9rem;
          }
          input[type="email"],
          input[type="password"] {
            padding: var(--space-3);
            border: 1px solid var(--surface);
            border-radius: var(--radius);
            background: white;
            width: 100%;
          }
          input:focus {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
          }
          .form-error {
            color: var(--error);
            font-size: 0.9rem;
          }
          .btn {
            padding: var(--space-3);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            font-weight: 600;
            min-height: 44px;
          }
          .btn-primary {
            background: var(--primary);
            color: white;
          }
        `}</style>
      </form>
    );
  }

  return (
    <div className="admin-list">
      <div className="admin-header">
        <span className="admin-user">{session.user.email}</span>
        <button type="button" className="btn btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {loading ? (
        <p className="admin-status">Cargando entradas pendientes...</p>
      ) : entries.length === 0 ? (
        <div className="admin-empty">
          <p>No hay entradas pendientes de revisión.</p>
        </div>
      ) : (
        <>
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
        </>
      )}

      <style>{`
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--surface);
        }
        .admin-user {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .btn-logout {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--surface);
          border-radius: var(--radius);
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
          min-height: 44px;
        }
        .admin-status, .admin-empty {
          text-align: center;
          padding: var(--space-5);
          color: var(--text-muted);
        }
        .admin-count {
          font-weight: 600;
          margin-bottom: var(--space-3);
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .admin-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .review-card {
          border: 1px solid var(--surface);
          border-radius: var(--radius);
          padding: var(--space-3);
          background: white;
        }
        .review-maya {
          font-weight: 600;
          margin-bottom: var(--space-1);
        }
        .review-es {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: var(--space-2);
        }
        .review-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          font-size: 0.8rem;
          color: var(--text-muted);
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
          border: 1px solid var(--surface);
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
          background: var(--success);
          color: white;
          border-color: var(--success);
        }
        .btn-reject {
          background: white;
          color: var(--error);
          border-color: var(--error);
        }
      `}</style>
    </div>
  );
}
