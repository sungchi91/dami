import { useEffect, useState } from 'react';
import { adjustImage, approveImage } from '../services/api';
import type { FormValues, StagingImage } from '../types';

interface Props {
  image: StagingImage;
  formValues: FormValues;
  onImageUpdate: (image: StagingImage) => void;
}

export function StagingArea({ image, formValues, onImageUpdate }: Props) {
  const [adjustment, setAdjustment] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSaved(null);
    setError('');
  }, [image.imageBase64]);

  async function handleAdjust() {
    if (!adjustment.trim()) return;
    setError('');
    setAdjusting(true);
    try {
      const result = await adjustImage(image, adjustment);
      onImageUpdate({ ...image, imageBase64: result.imageBase64, mimeType: result.mimeType });
      setAdjustment('');
      setSaved(null);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Adjustment failed');
    } finally {
      setAdjusting(false);
    }
  }

  async function handleApprove() {
    setError('');
    setApproving(true);
    try {
      const entry = await approveImage(image, formValues);
      setSaved(entry.filePath);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Save failed');
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border border-stone-200 bg-white">
        <img
          src={`data:${image.mimeType};base64,${image.imageBase64}`}
          alt="Generated"
          className="w-full object-cover"
        />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-300"
          placeholder="e.g. make the background slightly cooler"
          value={adjustment}
          onChange={(e) => setAdjustment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdjust()}
          disabled={adjusting}
        />
        <button
          onClick={handleAdjust}
          disabled={adjusting || !adjustment.trim()}
          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {adjusting ? '…' : 'Adjust'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {saved ? (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Saved to <span className="font-mono">{saved}</span>
        </div>
      ) : (
        <button
          onClick={handleApprove}
          disabled={approving}
          className="w-full bg-stone-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {approving ? 'Saving…' : 'Approve & Save'}
        </button>
      )}

      <details className="text-xs text-stone-400">
        <summary className="cursor-pointer select-none">Prompt used</summary>
        <p className="mt-1 whitespace-pre-wrap leading-relaxed">{image.promptUsed}</p>
      </details>
    </div>
  );
}
