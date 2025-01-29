
import './assets/css/fontawesome.css';
import './assets/css/templatemo-574-mexant.css';
import './assets/css/owl.css';
import './assets/css/animate.css';

import './vendor/bootstrap/css/bootstrap.min.css';

import Header from './Components/Header';

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import LoadingBar from 'react-top-loading-bar';

import Formateur from './Components/Formateur';
import FormationInscriptionWithStripe from './Components/Formation_inscription';
import Module_list_page from './Components/Module_list_page';
import Contact from './Components/Contact';
import About from './Components/About';
import Formtion_list_page from './Components/Formtion_list_page';
import Home from './Components/Home';

import Partner from './Components/Partner';
import Footer from './Components/Footer';


function App() {
  const loadingBarRef = useRef(null);
  const location = useLocation(); // Pour détecter le changement de route

  useEffect(() => {
    if (loadingBarRef.current) {
      loadingBarRef.current.continuousStart();
    }

    const timer = setTimeout(() => {
      if (loadingBarRef.current) {
        loadingBarRef.current.complete();
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (loadingBarRef.current) {
        loadingBarRef.current.complete();
      }
    };
  }, [location]);

  return (
<>
      <LoadingBar color="#f11946" ref={loadingBarRef} className="loading-bar" />
      <Header />
      

        <Routes>
        <Route exact path="/" element={<Home />} />
   
        <Route exact path="/Formtion_list_page" element={<Formtion_list_page />} />
        <Route exact path="/About" element={<About />} />
        <Route exact path="/Contact" element={<Contact />} />
        <Route exact path="/Module_list_page" element={<Module_list_page />} />
        <Route exact
  path="/Formation_inscription/:formationId"
  element={<FormationInscriptionWithStripe />} // Remplacer par le composant qui inclut Elements
/>

        <Route exact path="/Formateur" element={<Formateur />} />
  
        </Routes>
        {/* <Partner /> */}
        <Footer />
        
</>
  );
}

// Enveloppez votre application dans le Router
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
