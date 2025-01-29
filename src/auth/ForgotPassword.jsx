import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/img/logo_unit.png'; // Importez votre logo
import { Link } from "react-router-dom";
import { ClipLoader } from 'react-spinners';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // État pour le spinner

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Afficher le spinner

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, { email });
            toast.success(response.data.message);
        } catch (err) {
            setError(err.response.data.message);
            toast.error(err.response.data.message);
        } finally {
            setLoading(false); // Masquer le spinner
        }
    };

    return (
        <div className="bg-img">
            <ToastContainer />
            <div className="content">
                <img src={logo} alt="UNIT Logo" className="logo" />
                <header>Mot de passe oublié</header>
                <form onSubmit={handleSubmit}>
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
                    {error && <div className="error">{error}</div>}
                    <br />
                    <div className="field">
                        {loading ? (
                            <ClipLoader color="#36d7b7" size={35} /> // Spinner ici
                        ) : (
                            <input type="submit" value="ENVOYER" />
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

export default ForgotPassword;
