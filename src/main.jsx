import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { readPublishedContent } from './publishing'
import App from './App.jsx'
import Editor from './Editor.jsx'
import { refreshContent } from './data'

async function start() {
if (!window.__CHEMPEK_STANDALONE__) {
  try {
    window.__CHEMPEK_CONTENT__ = await readPublishedContent(AbortSignal.timeout(10000))
    refreshContent()
    window.__CHEMPEK_LIVE_READY__ = true
  } catch { window.__CHEMPEK_LIVE_READY__ = false }
}
const editing = new URLSearchParams(location.search).get('edit') === '1'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {editing ? <Editor /> : <App />}
  </StrictMode>,
)

}
start()
