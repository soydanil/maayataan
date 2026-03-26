import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const POLL_INTERVAL = 10_000;

export default function LiveCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase.rpc('get_table_count', {
        table_name: 'contributions',
      });
      if (!error && data !== null) setCount(data as number);
    }

    fetch();
    const interval = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-counter" aria-live="polite">
      <span className="counter-number">{count ?? '—'}</span>
      <span className="counter-label">
        voces en el corpus
      </span>
      <style>{`
        .live-counter {
          text-align: center;
          padding: var(--space-4) 0;
        }
        .counter-number {
          display: block;
          font-family: var(--font-mono);
          font-size: 3rem;
          font-weight: 600;
          color: var(--primary);
          line-height: 1;
        }
        .counter-label {
          display: block;
          color: var(--text-muted);
          margin-top: var(--space-2);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
