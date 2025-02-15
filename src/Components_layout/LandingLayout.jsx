// Exemple dans LandingLayout.jsx
import { useStateContext } from '../contexts/contextprovider';
import { Navigate, Outlet } from 'react-router-dom';
import '../assets/assets_landing/css/fontawesome.css';
import '../assets/assets_landing/css/templatemo-574-mexant.css';
import '../assets/assets_landing/css/owl.css';
import '../assets/assets_landing/css/animate.css';
import Header from '../components/landing_page/Header';
import Footer from '../components/landing_page/Footer';



function LandingLayout() {
  const { user } = useStateContext();


  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default LandingLayout;
