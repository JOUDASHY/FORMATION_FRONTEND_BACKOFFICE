
// import './assets/css/nucleo-svg.css';
import router from './router.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ContextProvider } from './contexts/contextprovider.jsx'

import reportWebVitals from './reportWebVitals';




// if (typeof global === 'undefined') {
//   window.global = window; // Définit global à window pour le navigateur
// }
// import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <ContextProvider>
<RouterProvider router={router}/>

</ContextProvider>
  </StrictMode>,
)
reportWebVitals();