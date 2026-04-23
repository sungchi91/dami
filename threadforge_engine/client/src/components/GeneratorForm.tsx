import { useEffect, useRef, useState } from 'react';
import { fetchConfig, generateImage } from '../services/api';
import type { AppConfig, FormValues, StagingImage } from '../types';

interface Props {
  initialValues?: FormValues | null;
  onGenerate: (image: StagingImage, values: FormValues) => void;
}

const DEFAULT_FORM: FormValues = {
  subject: '',
  assetTier: '',
  virtualSet: '',
  textureFidelity: 0,
};

export function GeneratorForm({ initialValues, onGenerate }: Props) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConfig().then((cfg) => {
      setConfig(cfg);
      setForm((prev) => ({
        ...prev,
        assetTier: cfg.assetTypes[0]?.id ?? '',
        virtualSet: cfg.virtualSets[0]?.id ?? '',
      }));
    });
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm(initialValues);
      setProductPreview(
        initialValues.productImageBase64
          ? `data:${initialValues.productImageMimeType ?? 'image/jpeg'};base64,${initialValues.productImageBase64}`
          : null,
      );
    }
  }, [initialValues]);

  const isFunctional = form.assetTier.toLowerCase() === 'functional';

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [header, base64] = dataUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
      setProductPreview(dataUrl);
      setForm((prev) => ({ ...prev, productImageBase64: base64, productImageMimeType: mimeType }));
    };
    reader.readAsDataURL(file);
  }

  function clearProductImage() {
    setProductPreview(null);
    setForm((prev) => ({ ...prev, productImageBase64: undefined, productImageMimeType: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleGenerate() {
    if (!form.subject.trim()) {
      setError('Subject is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await generateImage(form);
      onGenerate(
        { imageBase64: result.imageBase64, mimeType: result.mimeType, promptUsed: result.promptUsed },
        form,
      );
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  if (!config) {
    return <div className="p-8 text-stone-400 text-sm">Loading config…</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
          Asset Tier
        </label>
        <select
          className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300"
          value={form.assetTier}
          onChange={(e) => setForm({ ...form, assetTier: e.target.value })}
        >
          {config.assetTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {config.assetTypes.find((t) => t.id === form.assetTier) && (
          <p className="mt-1 text-xs text-stone-400">
            {config.assetTypes.find((t) => t.id === form.assetTier)!.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
          Virtual Set
        </label>
        <select
          className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300"
          value={form.virtualSet}
          onChange={(e) => setForm({ ...form, virtualSet: e.target.value })}
        >
          {config.virtualSets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
          Product Image <span className="normal-case text-stone-400 font-normal">(optional)</span>
        </label>
        {productPreview ? (
          <div className="relative inline-block">
            <img
              src={productPreview}
              alt="Product"
              className="h-24 w-24 object-cover rounded-lg border border-stone-200"
            />
            <button
              onClick={clearProductImage}
              className="absolute -top-1.5 -right-1.5 bg-stone-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-stone-600"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 cursor-pointer border border-dashed border-stone-300 rounded-lg px-4 py-3 hover:border-stone-400 transition-colors">
            <span className="text-stone-400 text-lg">+</span>
            <span className="text-sm text-stone-500">Upload product photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
          Subject
        </label>
        <textarea
          className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
          rows={3}
          placeholder="e.g. navy boat-and-tote resting on winery chair, soft bokeh background"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
      </div>

      {isFunctional && (
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
            Texture Fidelity — {form.textureFidelity}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={form.textureFidelity}
            onChange={(e) => setForm({ ...form, textureFidelity: Number(e.target.value) })}
            className="w-full accent-stone-600"
          />
          <div className="flex justify-between text-xs text-stone-400 mt-0.5">
            <span>Soft</span>
            <span>Macro detail</span>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-stone-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generating…' : 'Generate'}
      </button>
    </div>
  );
}
