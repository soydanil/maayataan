import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LiveCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Initial count
    supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .then(({ count: c }) => {
        if (c !== null) setCount(c);
      });

    // Realtime subscription
    const channel = supabase
      .channel('contributions-count')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contributions' },
        () => {
          setCount((prev) => (prev !== null ? prev + 1 : 1));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
