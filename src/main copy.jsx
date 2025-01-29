import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import router from './router.jsx'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { ContextProvider } from './contexts/contextprovider.jsx'
// import './index.css'

createRoot(document.getElementById('root')).render(





  <StrictMode>
<ContextProvider>
<RouterProvider router={router}/>

</ContextProvider>
  </StrictMode>,
)
