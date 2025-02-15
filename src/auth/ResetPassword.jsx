import React, { useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';
import Swal from 'sweetalert2';

import logo from '../assets/img/logo_unit.png';
import { ClipLoader } from 'react-spinners';

const ResetPassword = () => {
    const { token } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // État pour le spinner
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Gestion de la visibilité du mot de passe
    const togglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Afficher le spinner
    
        try {
            const response = await axiosClient.post('/auth/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
    
            // Notification de succès avec Swal
            Swal.fire({
                title: 'Succès',
                text: response.data.message,
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 5000,
            });
    
            // Redirection après 5 secondes
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        } catch (err) {
            setError(err.response.data.message);
    
            // Notification d'erreur avec Swal
            Swal.fire({
                title: 'Erreur',
                text: err.response.data.message,
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false); // Masquer le spinner
        }
    };
    
    return (
        <div className="bg-img">
            {/* <ToastContainer /> */}
            <div className="content-auth">
                <img src={logo} alt="UNIT Logo" className="logo" />
                <header>Réinitialiser le mot de passe</header>
                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <span className="fa fa-lock"></span>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Nouveau mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                                        <span className="show" onClick={togglePasswordVisibility}>
              <i className={`fa ${passwordVisible ? "fa-eye" : "fa-eye-slash"}`}></i>
            </span>
                    </div>
                    <div className="field space">
                        <span className="fa fa-lock"></span>
                        <input
                            type={passwordVisible ? "text" : "password"}
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
                        {loading ? (
                            <ClipLoader color="#36d7b7" size={35} /> // Spinner ici
                        ) : (
                            <input type="submit" value="RÉINITIALISER" />
                        )}
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
