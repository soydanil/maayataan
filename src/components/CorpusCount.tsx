import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  variant?: 'hero' | 'slide' | 'block';
}

export default function CorpusCount({ variant = 'block' }: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .then(({ count: c }) => {
        if (c !== null) setCount(c);
      });

    const channel = supabase
      .channel('corpus-count-' + variant)
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

  const num = count ?? '—';

  if (variant === 'hero') {
    return (
      <div className="corpus-count corpus-count--hero" aria-live="polite">
        <span className="corpus-count__num">{num}</span>
        <span className="corpus-count__label">voces en el corpus</span>
      </div>
    );
  }

  if (variant === 'slide') {
    return (
      <div className="corpus-count corpus-count--slide" aria-live="polite">
        <span className="corpus-count__num">{num}</span>
        <span className="corpus-count__label">voces en el corpus</span>
      </div>
    );
  }

  // block (original centered style)
  return (
    <div className="corpus-count corpus-count--block" aria-live="polite">
      <span className="corpus-count__num">{num}</span>
      <span className="corpus-count__label">voces en el corpus</span>
    </div>
  );
}
