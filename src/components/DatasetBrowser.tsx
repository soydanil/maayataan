import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Contribution, Dialect } from '../lib/database.types';

const PAGE_SIZE = 20;

export default function DatasetBrowser() {
  const [entries, setEntries] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialect, setDialect] = useState<Dialect | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [dialect, page]);

  async function loadEntries() {
    setLoading(true);
    let query = supabase
      .from('contributions')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    if (dialect) {
      query = query.eq('dialect', dialect);
    }
    if (search.trim()) {
      query = query.or(
        `maya_text.ilike.%${search.trim()}%,spanish_translation.ilike.%${search.trim()}%`
      );
    }

    const { data, error } = await query;
    if (!error && data) {
      setEntries(data);
      setHasMore(data.length > PAGE_SIZE);
      if (data.length > PAGE_SIZE) data.pop();
    }
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    loadEntries();
  }

  return (
    <div className="browser">
      <form onSubmit={handleSearch} className="browser-filters">
        <input
          type="search"
          placeholder="Buscar en maya o español..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar en el corpus"
        />
        <select
          value={dialect}
          onChange={(e) => {
            setDialect(e.target.value as Dialect | '');
            setPage(0);
          }}
          aria-label="Filtrar por variante dialectal"
        >
          <option value="">Todas las variantes</option>
          <option value="oriente">Oriente</option>
          <option value="noroccidente">Noroccidente</option>
          <option value="centro">Centro</option>
          <option value="sur">Sur</option>
          <option value="costa">Costa</option>
        </select>
        <button type="submit" className="btn btn-primary">Buscar</button>
      </form>

      {loading ? (
        <p className="browser-status">Cargando...</p>
      ) : entries.length === 0 ? (
        <div className="browser-empty">
          <p className="empty-maya">Mix máak yaan waye'</p>
          <p className="empty-es">Aún no hay entradas aprobadas.</p>
          <p className="empty-cta">
            <a href="/">Sé el primero en contribuir</a>
          </p>
        </div>
      ) : (
        <>
          <ul className="entry-list">
            {entries.map((entry) => (
              <li key={entry.id} className="entry-card">
                <p className="entry-maya">{entry.maya_text}</p>
                <p className="entry-es">{entry.spanish_translation}</p>
                <div className="entry-meta">
                  <span>{entry.dialect}</span>
                  <span>{entry.contributor_name}</span>
                  {entry.audio_url && <span>🔊</span>}
                </div>
              </li>
            ))}
          </ul>

          <div className="browser-pagination">
            <button
              type="button"
              className="btn"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Anterior
            </button>
            <button
              type="button"
              className="btn"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}

      <style>{`
        .browser { display: flex; flex-direction: column; gap: var(--space-4); }
        .browser-filters {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .browser-filters input[type="search"] {
          flex: 1;
          min-width: 200px;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          background: white;
        }
        .browser-filters select {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          background: white;
        }
        .browser-filters input:focus,
        .browser-filters select:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }
        .btn {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          background: white;
          cursor: pointer;
          font-weight: 600;
          min-height: 44px;
        }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-primary {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
        .browser-status {
          color: var(--color-muted);
          text-align: center;
          padding: var(--space-5);
        }
        .browser-empty {
          text-align: center;
          padding: var(--space-6) 0;
        }
        .empty-maya { font-size: 1.25rem; font-weight: 700; }
        .empty-es { color: var(--color-muted); margin-bottom: var(--space-3); }
        .empty-cta a { color: var(--color-primary); font-weight: 600; }
        .entry-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .entry-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          padding: var(--space-3);
          background: white;
        }
        .entry-maya {
          font-weight: 600;
          margin-bottom: var(--space-1);
        }
        .entry-es {
          color: var(--color-muted);
          font-size: 0.9rem;
          margin-bottom: var(--space-2);
        }
        .entry-meta {
          display: flex;
          gap: var(--space-3);
          font-size: 0.8rem;
          color: var(--color-muted);
        }
        .browser-pagination {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
}
