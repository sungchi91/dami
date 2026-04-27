import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import CustomizerWidget from './components/CustomizerWidget'

const mount = () => {
  const container = document.getElementById('ember-lane-customizer')
  if (!container) return

  const root = document.createElement('div')
  root.id = 'ember-lane-customizer-root'
  root.className = 'ember-lane-customizer-scope'
  container.appendChild(root)

  createRoot(root).render(
    <React.StrictMode>
      <CustomizerWidget />
    </React.StrictMode>
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
