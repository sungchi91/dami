import { useEffect, useState } from 'react';
import { fetchHistory } from '../services/api';
import type { FormValues, HistoryEntry } from '../types';

interface Props {
  onRehydrate: (values: FormValues) => void;
}

export function RecipeBook({ onRehydrate }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  function handleClick(entry: HistoryEntry) {
    onRehydrate({
      subject: entry.subject,
      assetTier: entry.assetTier,
      virtualSet: entry.virtualSet,
      textureFidelity: entry.textureFidelity,
    });
  }

  if (loading) {
    return <div className="p-8 text-stone-400 text-sm">Loading history…</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="p-12 text-center text-stone-400 text-sm">
        No approved images yet. Generate and approve one to start your recipe book.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {entries.map((entry) => (
        <button
          key={entry.id}
          onClick={() => handleClick(entry)}
          className="group text-left rounded-xl overflow-hidden border border-stone-200 bg-white hover:border-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-300"
        >
          <div className="aspect-square bg-stone-100 overflow-hidden">
            <img
              src={`/static/outputs/${entry.filePath}`}
              alt={entry.subject}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div className="px-3 py-2.5">
            <p className="text-xs font-medium text-stone-700 truncate">{entry.subject || '—'}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {entry.assetTier} · {new Date(entry.timestamp).toLocaleDateString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
