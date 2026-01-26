import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initI18nForWeb } from '@repo/i18n'
import App from './App.tsx'

// Khởi tạo i18n
initI18nForWeb({
  debug: import.meta.env.MODE === 'development'
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
