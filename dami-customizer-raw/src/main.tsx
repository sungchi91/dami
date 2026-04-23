import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'

const mount = () => {
  const container = document.getElementById('dami-customizer')
  if (!container) return

  const root = document.createElement('div')
  root.id = 'dami-customizer-root'
  container.appendChild(root)

  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
