import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { MusicProvider } from './context/MusicContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <MusicProvider>
        <App />
      </MusicProvider>
    </AuthProvider>
  </StrictMode>,
)
