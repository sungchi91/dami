import { useState } from 'react'
import SafeZoneConfigurator from './SafeZoneConfigurator'
import FixedLayoutConfigurator from './FixedLayoutConfigurator'
import PayloadVerifier from './PayloadVerifier'

type Tab = 'safezone' | 'fixed' | 'verifier'

export default function App() {
  const [tab, setTab] = useState<Tab>('safezone')

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1e293b', minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', background: '#fff', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Ember Lane Admin</h1>
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          {([
            { id: 'safezone', label: 'Safe Zone Configurator' },
            { id: 'fixed',    label: 'Fixed Layout Positions' },
            { id: 'verifier', label: 'Order Preview' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none',
                background: tab === t.id ? '#f1f5f9' : 'transparent',
                color: tab === t.id ? '#1e293b' : '#64748b',
                fontWeight: tab === t.id ? 600 : 400,
                fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ padding: '2rem' }}>
        {tab === 'safezone' && <SafeZoneConfigurator />}
        {tab === 'fixed'    && <FixedLayoutConfigurator />}
        {tab === 'verifier' && <PayloadVerifier />}
      </main>
    </div>
  )
}
