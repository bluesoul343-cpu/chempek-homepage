import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Editor from './Editor.jsx'
const editing = new URLSearchParams(location.search).get('edit') === '1'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {editing ? <Editor /> : <App />}
  </StrictMode>,
)
