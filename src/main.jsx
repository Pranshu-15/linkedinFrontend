import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContext from './context/AuthContext.jsx'
import SocketProvider from './context/SocketContext.jsx'
import UserContext from './context/userContext.jsx'

createRoot(document.getElementById('root')).render(
 <BrowserRouter>
 <AuthContext>
<UserContext>
  <SocketProvider>
    <App />
  </SocketProvider>
</UserContext>
</AuthContext>
</BrowserRouter>
 
)
