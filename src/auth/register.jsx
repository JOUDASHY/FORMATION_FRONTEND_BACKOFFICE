import axios from "axios";
import { useRef, useState } from "react";  // Correctement importé
import { Link } from "react-router-dom";
import axiosClient from "../axiosClient";
import { useStateContext } from "../contexts/contextprovider";
import logo from '../assets/img/logo_unit.png'; // Importez votre logo
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from "sweetalert2";
import Select from 'react-select';


export default function Register() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const options = [
      { value: 'masculin', label: 'Masculin' },
      { value: 'feminin', label: 'Féminin' }
  ];
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { setUser, setToken } = useStateContext();
  const [sex, setSex] = useState('');
  const handleChange_sex = (e) => {
    setSex(e.target.value);  // Mettre à jour l'état 'sex' avec la valeur sélectionnée
  };
//   const handleChange_sex = (selectedOption) => {
//       setSex(selectedOption ? selectedOption.value : ''); // Met à jour la valeur de 'sex'
//   };

  const togglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible);
  };

  const submit = (ev) => {
      ev.preventDefault();

      // Vérifiez si le champ 'sex' est bien défini
      if (!sex) {
          toast.error("Le sexe est obligatoire.");
          return; // Si non, stoppez la soumission
      }

      const payload = {
          name: nameRef.current.value,
          email: emailRef.current.value,
          password: passwordRef.current.value,
          sex: sex, // Ajoutez le sexe au payload
      };

      axiosClient.post("/auth/register", payload)
          .then(({ data }) => {
              setUser(data.user);
              setToken(data.access_token);
              Swal.fire({
                  title: "Bravo !",
                  text: "Création du compte réussie ! Vous allez maintenant vous connecter.",
                  icon: "success"
              });
          })
          .catch(err => {
              const response = err.response;
              if (response && response.status === 422) {
                  console.log(response.data.errors);
                  Swal.fire({
                      title: "Oops...",
                      text: response.data.errors.join(", "), // Affiche les erreurs
                      icon: "error"
                  });
              }
          });
  };

  return (
      <div className="bg-img">
          <ToastContainer />
          <div className="content">
              <img src={logo} alt="UNIT Logo" className="logo" />
              <header>Inscription à UN-IT</header>
              <form onSubmit={submit}>
                  <div className="field">
                      <span className="fa fa-user"></span>
                      <input
                          type="text"
                          placeholder="Nom"
                          ref={nameRef}
                          required
                      />
                  </div>
                  <div className="field space">
                      <span className="fa fa-envelope"></span>
                      <input
                          type="email"
                          placeholder="Email"
                          ref={emailRef}
                          required
                      />
                  </div>
                  <div className="field space">
  <span className="fa fa-user"></span>
  
  <div className="radio-buttons">
        <label className={`radio-label ${sex === 'masculin' ? 'selected' : ''}`}>
          <input
            type="radio"
            value="masculin"
            checked={sex === 'masculin'}
            onChange={handleChange_sex}
            name="sex"
            className="radio-input"
          />
          <span className="radio-custom"></span>
          Masculin
        </label>

        <label className={`radio-label ${sex === 'féminin' ? 'selected' : ''}`}>
          <input
            type="radio"
            value="féminin"
            checked={sex === 'féminin'}
            onChange={handleChange_sex}
            name="sex"
            className="radio-input"
          />
          <span className="radio-custom"></span>
          Féminin
        </label>
      </div>
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
                  <br />
                  <div className="field">
                      <input type="submit" value="S'INSCRIRE" />
                  </div>
              </form>
              <div className="login">Ou inscrivez-vous avec</div>
              {/* <div className="links">
                  <div className="facebook">
                      <i className="fab fa-facebook-f"><span>Facebook</span></i>
                  </div>
                  <div className="instagram">
                      <i className="fab fa-instagram"><span>Instagram</span></i>
                  </div>
              </div> */}
              <div className="signup">
                  Vous avez déjà un compte ? <Link to="/login">Connectez-vous maintenant</Link>
              </div>
          </div>
      </div>
  );
}
