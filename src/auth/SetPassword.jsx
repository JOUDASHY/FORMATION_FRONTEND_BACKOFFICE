import React, { useState } from 'react';

import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/img/logo_unit.png';

const ResetPassword = () => {
    const { token } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    // Extraire l'email des paramètres de requête
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Gestion de la visibilité du mot de passe
    const togglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axiosClient.post('/auth/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            toast.success(response.data.message);

            // Redirection vers la page de connexion après 2 secondes pour permettre la lecture du message de succès
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.response.data.message);
            toast.error(err.response.data.message);
        }
    };
    return (
        <div className="bg-img">
            <ToastContainer />
            <div className="content-auth">
                <img src={logo} alt="UNIT Logo" className="logo" />
                <header>Initialiser le mot de passe de {email}</header>
                <form onSubmit={handleSubmit}>
               

                    <div className="field space">
            <span className="fa fa-lock"></span>
            <input
              type={passwordVisible ? "text" : "password"}
              className="pass-key"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="show" onClick={togglePasswordVisibility}>
              <i className={`fa ${passwordVisible ? "fa-eye" : "fa-eye-slash"}`}></i>
            </span>
          </div>

                    
           
          {/* Champ Mot de passe */}
          <div className="field space">
            <span className="fa fa-lock"></span>
            <input
              type={passwordVisible ? "text" : "password"}
              className="pass-key"
              placeholder="Confirmer le mot de passe"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
            <span className="show" onClick={togglePasswordVisibility}>
              <i className={`fa ${passwordVisible ? "fa-eye" : "fa-eye-slash"}`}></i>
            </span>
          </div>

                    {error && <div className="error">{error}</div>}
                    <br />
                    <div className="field">

                        <input type="submit" value="INITIALISER" />
                    </div>
                </form>
                <div className="signup">
                    Vous avez un compte ? <Link to='/login'>Connectez-vous maintenant</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
