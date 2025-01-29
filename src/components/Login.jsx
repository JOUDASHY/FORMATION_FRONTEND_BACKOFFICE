import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import logo from '../assets/img/logo_unit.png'; // Importez votre logo

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login button clicked");
  
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password,
      });
      console.log('Login successful, token received:', response.data.access_token);
      toast.success('Connexion réussie ! Redirection vers le tableau de bord...');
      onLoginSuccess(response.data.access_token);
      navigate('/');
      
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Email ou mot de passe incorrect.');
    }
  };
  
  
  return (
    <div className="bg-img">
      <ToastContainer />
      <div className="content">
        <img src={logo} alt="UNIT Logo" className="logo" /> {/* Ajout du logo */}
        <header>Connexion à UNIT</header>
        <form onSubmit={handleLogin}>
          <div className="field">
            <span className="fa fa-user"></span>
            <input
              type="email"
              placeholder="Email ou Téléphone"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field space">
            <span className="fa fa-lock"></span>
            <input
              type={passwordVisible ? "text" : "password"}
              className="pass-key"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="show" onClick={togglePasswordVisibility}>
              <i className={`fa ${passwordVisible ? "fa-eye" : "fa-eye-slash"}`}></i>
            </span>
          </div>
          <div className="pass">
            <a href="#">Mot de passe oublié ?</a>
          </div>
          <div className="field">
            <input type="submit" value="CONNEXION" />
          </div>
        </form>
        <div className="login">Ou connectez-vous avec</div>
        <div className="links">
          <div className="facebook">
            <i className="fab fa-facebook-f"><span>Facebook</span></i>
          </div>
          <div className="instagram">
            <i className="fab fa-instagram"><span>Instagram</span></i>
          </div>
        </div>
        <div className="signup">
          Vous n'avez pas de compte ? <a href="/register">Inscrivez-vous maintenant</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
