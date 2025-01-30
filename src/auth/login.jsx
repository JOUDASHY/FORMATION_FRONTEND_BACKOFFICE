import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStateContext } from "../contexts/contextprovider";
import { GoogleLogin } from '@react-oauth/google'; // Importer le composant GoogleLogin
import logo from "../assets/img/logo_unit.png";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReCAPTCHA from "react-google-recaptcha"; // Importer le composant reCAPTCHA
import { ClipLoader } from 'react-spinners'; // Import du spinner
const Logins = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false); // État pour vérifier si reCAPTCHA a été vérifié
  const { setUser, setToken } = useStateContext();
  const [loading, setLoading] = useState(false); // État pour le spinner

  // Gestion de la visibilité du mot de passe
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Soumission du formulaire de connexion
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Afficher le spinner

    // if (!captchaVerified) {
    //   toast.error("Veuillez vérifier que vous n'êtes pas un robot.");
    //   return;
    // }

    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        payload
      );
      setUser(data.user);
      setToken(data.access_token, data.expires_in);
      localStorage.setItem("USER_INFO", JSON.stringify(data.user));

      // Message de succès
      toast.success("Connexion réussie !");
    } catch (error) {
      const response = error.response;

      if (response) {
        switch (response.status) {
          case 401:
            toast.error("Email ou mot de passe incorrect. Veuillez réessayer.");
            break;
          case 404:
            toast.error("Compte introuvable. Veuillez vérifier vos informations.");
            break;
          default:
            toast.error(
              "Une erreur s'est produite. Veuillez réessayer plus tard."
            );
        }
      } else {
        toast.error(
          "Impossible de se connecter au serveur. Vérifiez votre connexion."
        );
      }
    } finally {
      setLoading(false); // Masquer le spinner
  }
  };



  // Gestion de la réponse de l'authentification Google
  const handleGoogleLogin = async (credentialResponse) => {
    console.log('clicked google login')
    if (credentialResponse.credential) {
      console.log("Google Token:", credentialResponse.credential);  // Vérifiez la valeur du jeton
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google/token`, {
          token: credentialResponse.credential,
      });

        setUser(data.user);
        setToken(data.access_token, data.expires_in);
        localStorage.setItem("USER_INFO", JSON.stringify(data.user));

        // Message de succès
        toast.success("Connexion réussie via Google !");
      } catch (error) {
        toast.error("Erreur lors de la connexion avec Google.");
      }
    }
  };

  // Fonction pour gérer la vérification du reCAPTCHA
  const handleCaptchaChange = (value) => {
    if (value) {
      setCaptchaVerified(true); // ReCAPTCHA vérifié
    }
  };

  return (
    <div className="bg-img">
      <ToastContainer />
      <div className="content">
        <img src={logo} alt="UNIT Logo" className="logo" />
        <header>Connexion à UN-IT</header>
        <form onSubmit={handleSubmit}>
          {/* Champ Email */}
          <div className="field">
            <span className="fa fa-user"></span>
            <input
              type="email"
              placeholder="Email"
              ref={emailRef}
              required
            />
          </div>

          {/* Champ Mot de passe */}
          <div className="field space">
            <span className="fa fa-lock"></span>
            <input
              type={passwordVisible ? "text" : "password"}
              className="pass-key"
              placeholder="Mot de passe"
              ref={passwordRef}
              required
            />
            <span className="show" onClick={togglePasswordVisibility}>
              <i className={`fa ${passwordVisible ? "fa-eye" : "fa-eye-slash"}`}></i>
            </span>
          </div>

          {/* Lien mot de passe oublié */}
          <div className="pass">
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
          </div>

     

                {/* ReCAPTCHA */}
                <div className="mb-3">
        
                  <div className="g-recaptcha-container">
                    <ReCAPTCHA
                      sitekey="6LdDBY4qAAAAAIDafxFRtMsXNbQpmewzZYNLd46e"
                      onChange={handleCaptchaChange}
                    />
                  </div>
                </div>


          {/* Bouton Connexion */}
          <div className="field">
  <button disabled={loading} onClick={handleSubmit} className="connexion">
  {loading ? (
                          <ClipLoader color="#ffffff" size={20} /> // Spinner ici
                        ) : (
                          <> CONNEXION 
                           </>
                        )}</button>
</div>
        </form>

        {/* Connexion via réseaux sociaux */}
        <div className="login">Ou connectez-vous avec</div>
        <div className="links">
          <div className="w-100 d-flex justify-content-center align-items-center my-2">
            <button
              className="btn btn-dark btn-lg d-flex align-items-center gap-2 shadow-lg px-4 py-2 w-100"
              onClick={handleGoogleLogin}
              style={{
                color: "white",
                borderRadius: "10px",
                transition: "all 0.3s ease",
                minWidth: "250px", // Largeur minimale si nécessaire
                justifyContent: "center", // Centre le contenu
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#333";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#000";
              }}
            >
              <i className="bi bi-google" style={{ fontSize: "1.5rem", color: "#fff" }}></i>
              <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Se connecter avec Google
              </span>
            </button>
          </div>
        </div>

        {/* Lien inscription */}
        <div className="signup">
          Vous n'avez pas de compte ?{" "}
          <Link to="/register">Inscrivez-vous maintenant</Link>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  return (
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_API_KEY}>
  <Logins />
</GoogleOAuthProvider>

  );
};

export default Login;
