import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Table = 'contributions' | 'speakers_interest' | 'allies_interest';

const TABLE_CONFIG: Record<Table, { label: string }> = {
  contributions: { label: 'voces en el corpus' },
  speakers_interest: { label: 'hablantes registrados' },
  allies_interest: { label: 'aliados registrados' },
};

const POLL_INTERVAL = 10_000; // 10 seconds

interface Props {
  variant?: 'hero' | 'slide' | 'block';
  table?: Table;
}

async function fetchCount(table: Table): Promise<number | null> {
  const { data, error } = await supabase.rpc('get_table_count', { table_name: table });
  if (error || data === null) return null;
  return data as number;
}

export default function CorpusCount({ variant = 'block', table = 'contributions' }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const { label } = TABLE_CONFIG[table];

  useEffect(() => {
    // Initial fetch
    fetchCount(table).then((c) => {
      if (c !== null) setCount(c);
    });

    // Poll for updates
    const interval = setInterval(() => {
      fetchCount(table).then((c) => {
        if (c !== null) setCount(c);
      });
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const num = count ?? '—';
  const cls = `corpus-count corpus-count--${variant}`;

  return (
    <div className={cls} aria-live="polite">
      <span className="corpus-count__num">{num}</span>
      <span className="corpus-count__label">{label}</span>
    </div>
  );
}
