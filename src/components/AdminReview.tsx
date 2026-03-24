import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button, FormField, Card } from './ui';
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
        <FormField label="Correo electrónico" htmlFor="admin-email">
          <input
            type="email"
            id="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Contraseña" htmlFor="admin-password">
          <input
            type="password"
            id="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormField>
        {authError && <p className="form-error" role="alert">{authError}</p>}
        <Button type="submit" variant="primary">Iniciar sesión</Button>

        <style>{`
          .login-form {
            max-width: 360px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: var(--space-3);
          }
        `}</style>
      </form>
    );
  }

  return (
    <div className="admin-list">
      <div className="admin-header">
        <span className="admin-user">{session.user.email}</span>
        <Button variant="ghost" onClick={handleLogout}>
          Cerrar sesión
        </Button>
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
            <Card key={entry.id}>
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
                <Button
                  variant="approve"
                  disabled={updating === entry.id}
                  onClick={() => updateStatus(entry.id, 'approved')}
                  aria-label={`Aprobar entrada de ${entry.contributor_name}`}
                >
                  Aprobar
                </Button>
                <Button
                  variant="reject"
                  disabled={updating === entry.id}
                  onClick={() => updateStatus(entry.id, 'rejected')}
                  aria-label={`Rechazar entrada de ${entry.contributor_name}`}
                >
                  Rechazar
                </Button>
              </div>
            </Card>
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
      `}</style>
    </div>
  );
}
