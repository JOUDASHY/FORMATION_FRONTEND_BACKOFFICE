import React, { useState, useRef } from "react";

import axios from 'axios';
// import client from "../assets/images/client-01.png";
import { ClipLoader } from 'react-spinners'; // Import du spinner
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // État pour le spinner

  const notificationSystem = useRef(null);

  async function save(event) {
    event.preventDefault();
    setLoading(true); // Afficher le spinner
  
    try {
      // D'abord, enregistrement des données dans votre base de données via votre API (axios)
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/contacts`, {
        name,
        email,
        message,
      });
  
      // Envoi des données à Web3Forms
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("message", message);
      formData.append("access_key", "30e0198b-9fe5-4e87-97a5-97dc8ac90f58"); // Web3Forms API key
  
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)), // Formate les données en JSON
      });
  
      const result = await res.json();
  
      // Vérifier la réponse de Web3Forms
      if (result.success) {
        toast.success("Message envoyé avec succès");
        resetForm();
      } else {
        toast.error("Échec de l'envoi à Web3Forms");
      }
    } catch (err) {
      toast.error("Échec d'envoi de message");
    } finally {
      setLoading(false); // Masquer le spinner
    }
  }
  

  const showNotification = (message, level) => {
    const notification = notificationSystem.current;
    notification.addNotification({
      message,
      level,
    });
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <>
                 <ToastContainer />

      <div className="page-heading">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="header-text">
                <h2>Contactez-nous</h2>
                <div className="div-dec"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="map">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div id="map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3172.4925756190674!2d47.08364!3d-21.45531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b70b1bf12f09%3A0xd722755c88221c4e!2sYour%20Location!5e0!3m2!1sen!2s!4v1630007225462!5m2!1sen!2s"
                  width="100%"
                  height="450px"
                  frameBorder="0"
                  style={{ border: 0, borderRadius: '5px', position: 'relative', zIndex: 2 }}
                  allowFullScreen=""
                  aria-hidden="false"
                  tabIndex="0"
                ></iframe>
              </div>
            </div>
            <div className="col-lg-10 offset-lg-1">
              <div className="row">
                <div className="col-lg-4">
                  <div className="info-item">
                    <i className="fa fa-envelope"></i>
                    <h4>Addresse Mail</h4>
                    <a href="mailto:info@company.com">contact@unityfianar.site</a>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="info-item">
                    <i className="fa fa-phone"></i>
                    <h4>Numero tel</h4>
                    <a href="tel:0100200340">+26134930349</a>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="info-item">
                    <i className="fa fa-map-marked-alt"></i>
                    <h4>Addresse</h4>
                    <a href="#">Imandry, Fianarantsoa</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-us-form">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="section-heading">
                <h6>Contact nous</h6>
                <h4>N'hésitez pas à nous envoyer un message</h4>
              </div>
            </div>

            <div className="col-lg-10 offset-lg-1">
              <form id="contact" action="" method="post">
                <div className="row">
                  <div className="col-lg-6">
                    <fieldset>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="votre nom..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </fieldset>
                  </div>

                  <div className="col-lg-6">
                    <fieldset>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="votre E-mail..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </fieldset>
                  </div>

                  <div className="col-lg-12">
                    <fieldset>
                      <textarea
                        name="message"
                        id="message"
                        placeholder="votre message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      ></textarea>
                    </fieldset>
                  </div>
                  <div className="col-lg-12">
                    <fieldset>
                      <button
                        type="submit"
                        onClick={save}
                        id="form-submit"
                        className="blue-button"
                        disabled={loading} // Désactiver le bouton pendant le chargement
                      >
                        {loading ? (
                          <ClipLoader color="#ffffff" size={20} /> // Spinner ici
                        ) : (
                          <><i className="fas fa-paper-plane"></i> Envoyer un message</>
                        )}
                      </button>
                    </fieldset>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
