import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Table = 'contributions' | 'speakers_interest' | 'allies_interest';

const TABLE_CONFIG: Record<Table, { label: string }> = {
  contributions: { label: 'voces en el corpus' },
  speakers_interest: { label: 'hablantes registrados' },
  allies_interest: { label: 'aliados registrados' },
};

interface Props {
  variant?: 'hero' | 'slide' | 'block';
  table?: Table;
}

export default function CorpusCount({ variant = 'block', table = 'contributions' }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const { label } = TABLE_CONFIG[table];

  useEffect(() => {
    supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .then(({ count: c }) => {
        if (c !== null) setCount(c);
      });

    const channel = supabase
      .channel(`${table}-count-${variant}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        () => {
          setCount((prev) => (prev !== null ? prev + 1 : 1));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
