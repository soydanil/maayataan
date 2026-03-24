import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button, FormField, Card } from './ui';
import type { Contribution, SpeakerInterest, AllyInterest } from '../lib/database.types';
import type { Session } from '@supabase/supabase-js';

type Tab = 'pending' | 'approved' | 'speakers' | 'allies';

const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Por validar' },
  { key: 'approved', label: 'Validadas' },
  { key: 'speakers', label: 'Hablantes' },
  { key: 'allies', label: 'Aliados' },
];

export default function AdminReview() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
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
    <div className="admin-panel">
      <div className="admin-header">
        <span className="admin-user">{session.user.email}</span>
        <Button variant="ghost" onClick={handleLogout}>Cerrar sesión</Button>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && <PendingTab />}
      {activeTab === 'approved' && <ApprovedTab />}
      {activeTab === 'speakers' && <SpeakersTab />}
      {activeTab === 'allies' && <AlliesTab />}

      <style>{`
        .admin-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--surface);
        }
        .admin-user {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .admin-tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid var(--surface);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .admin-tab {
          padding: var(--space-2) var(--space-3);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
          min-height: 44px;
        }
        .admin-tab:hover {
          color: var(--text);
        }
        .admin-tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .admin-status, .admin-empty {
          text-align: center;
          padding: var(--space-5);
          color: var(--text-muted);
        }
        .admin-count {
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .entry-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: var(--space-3);
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
        .reg-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          margin-top: var(--space-3);
        }
        .reg-table th {
          text-align: left;
          font-weight: 600;
          padding: var(--space-2);
          border-bottom: 2px solid var(--surface);
          color: var(--text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .reg-table td {
          padding: var(--space-2);
          border-bottom: 1px solid var(--surface);
          vertical-align: top;
        }
        .reg-table tr:last-child td {
          border-bottom: none;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: var(--radius);
          font-size: 0.7rem;
          font-weight: 600;
        }
        .badge-yes {
          background: color-mix(in srgb, var(--success) 15%, var(--card-bg));
          color: var(--success);
        }
        .badge-no {
          background: var(--surface);
          color: var(--text-muted);
        }
        .role-tag {
          display: inline-block;
          padding: 2px 6px;
          background: var(--surface);
          border-radius: var(--radius);
          font-size: 0.7rem;
          margin: 1px 2px;
        }
        .reg-date {
          color: var(--text-muted);
          font-size: 0.75rem;
        }
        .table-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}

function PendingTab() {
  const [entries, setEntries] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    setLoading(true);
    const { data } = await supabase
      .from('contributions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100);
    if (data) setEntries(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setUpdating(id);
    const { error } = await supabase
      .from('contributions')
      .update({ status })
      .eq('id', id);
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id));
    setUpdating(null);
  }

  if (loading) return <p className="admin-status">Cargando...</p>;
  if (entries.length === 0) return <p className="admin-empty">No hay entradas pendientes.</p>;

  return (
    <div>
      <p className="admin-count">{entries.length} pendientes</p>
      <div className="entry-list">
        {entries.map((entry) => (
          <Card key={entry.id}>
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
            <div className="review-actions">
              <Button
                variant="approve"
                disabled={updating === entry.id}
                onClick={() => updateStatus(entry.id, 'approved')}
              >
                Aprobar
              </Button>
              <Button
                variant="reject"
                disabled={updating === entry.id}
                onClick={() => updateStatus(entry.id, 'rejected')}
              >
                Rechazar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ApprovedTab() {
  const [entries, setEntries] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadApproved();
  }, []);

  async function loadApproved() {
    setLoading(true);
    const { data } = await supabase
      .from('contributions')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setEntries(data);
    setLoading(false);
  }

  async function revertToPending(id: string) {
    setUpdating(id);
    const { error } = await supabase
      .from('contributions')
      .update({ status: 'pending' })
      .eq('id', id);
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id));
    setUpdating(null);
  }

  if (loading) return <p className="admin-status">Cargando...</p>;
  if (entries.length === 0) return <p className="admin-empty">No hay entradas validadas aún.</p>;

  return (
    <div>
      <p className="admin-count">{entries.length} validadas</p>
      <div className="entry-list">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <p className="review-maya">{entry.maya_text}</p>
            <p className="review-es">{entry.spanish_translation}</p>
            <div className="review-meta">
              <span>{entry.contributor_name}</span>
              <span>{entry.dialect}</span>
              {entry.audio_url && (
                <audio controls preload="none" src={entry.audio_url}>
                  <track kind="captions" />
                </audio>
              )}
            </div>
            <div className="review-actions">
              <Button
                variant="ghost"
                disabled={updating === entry.id}
                onClick={() => revertToPending(entry.id)}
              >
                Revertir a pendiente
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SpeakersTab() {
  const [speakers, setSpeakers] = useState<SpeakerInterest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpeakers();
  }, []);

  async function loadSpeakers() {
    setLoading(true);
    const { data } = await supabase
      .from('speakers_interest')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setSpeakers(data);
    setLoading(false);
  }

  if (loading) return <p className="admin-status">Cargando...</p>;
  if (speakers.length === 0) return <p className="admin-empty">No hay registros de hablantes.</p>;

  return (
    <div>
      <p className="admin-count">{speakers.length} hablantes registrados</p>
      <div className="table-scroll">
        <table className="reg-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Dialecto</th>
              <th>Nativo</th>
              <th>Validador</th>
              <th>Mensaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {speakers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.email || '—'}</td>
                <td>{s.dialect || '—'}</td>
                <td>
                  <span className={`badge ${s.is_native_speaker ? 'badge-yes' : 'badge-no'}`}>
                    {s.is_native_speaker ? 'Sí' : 'No'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${s.wants_to_validate ? 'badge-yes' : 'badge-no'}`}>
                    {s.wants_to_validate ? 'Sí' : 'No'}
                  </span>
                </td>
                <td>{s.message || '—'}</td>
                <td className="reg-date">
                  {new Date(s.created_at).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlliesTab() {
  const [allies, setAllies] = useState<AllyInterest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllies();
  }, []);

  async function loadAllies() {
    setLoading(true);
    const { data } = await supabase
      .from('allies_interest')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setAllies(data);
    setLoading(false);
  }

  if (loading) return <p className="admin-status">Cargando...</p>;
  if (allies.length === 0) return <p className="admin-empty">No hay registros de aliados.</p>;

  const ROLE_LABELS: Record<string, string> = {
    desarrollo: 'Dev',
    diseño: 'Diseño',
    api_datos: 'API',
    donacion: 'Donación',
    institucion_educativa: 'Institución',
    otro: 'Otro',
  };

  return (
    <div>
      <p className="admin-count">{allies.length} aliados registrados</p>
      <div className="table-scroll">
        <table className="reg-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Organización</th>
              <th>Roles</th>
              <th>Mensaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {allies.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>{a.phone || '—'}</td>
                <td>{a.organization || '—'}</td>
                <td>
                  {a.roles.map((r) => (
                    <span key={r} className="role-tag">{ROLE_LABELS[r] || r}</span>
                  ))}
                </td>
                <td>{a.message || '—'}</td>
                <td className="reg-date">
                  {new Date(a.created_at).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
