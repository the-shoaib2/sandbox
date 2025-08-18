import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import useMonacoConfig from './components/MonacoConfig'

function AppWithMonaco() {
  useMonacoConfig();
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithMonaco />
  </StrictMode>,
)
