import { useState } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { StagingArea } from './components/StagingArea';
import { RecipeBook } from './components/RecipeBook';
import type { FormValues, StagingImage } from './types';

type Tab = 'generator' | 'recipes';

export default function App() {
  const [tab, setTab] = useState<Tab>('generator');
  const [stagingImage, setStagingImage] = useState<StagingImage | null>(null);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [rehydrateValues, setRehydrateValues] = useState<FormValues | null>(null);

  function handleGenerate(image: StagingImage, values: FormValues) {
    setStagingImage(image);
    setFormValues(values);
  }

  function handleRehydrate(values: FormValues) {
    setRehydrateValues(values);
    setTab('generator');
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-stone-800 tracking-tight">ThreadForge</h1>
          <p className="text-xs text-stone-400">d'ami visual engine</p>
        </div>
        <nav className="flex gap-1">
          {(['generator', 'recipes'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              {t === 'generator' ? 'Generator' : 'Recipe Book'}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'generator' && (
        <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-wider mb-4">
              Parameters
            </h2>
            <GeneratorForm
              initialValues={rehydrateValues}
              onGenerate={handleGenerate}
            />
          </section>

          <section>
            <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-wider mb-4">
              Staging Area
            </h2>
            {stagingImage && formValues ? (
              <StagingArea
                image={stagingImage}
                formValues={formValues}
                onImageUpdate={setStagingImage}
              />
            ) : (
              <div className="rounded-xl border-2 border-dashed border-stone-200 aspect-square flex items-center justify-center text-stone-400 text-sm">
                Generated image appears here
              </div>
            )}
          </section>
        </main>
      )}

      {tab === 'recipes' && (
        <main className="max-w-5xl mx-auto py-8">
          <div className="px-6 mb-4">
            <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-wider">
              Recipe Book
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Click any image to rehydrate its settings in the Generator
            </p>
          </div>
          <RecipeBook onRehydrate={handleRehydrate} />
        </main>
      )}
    </div>
  );
}
