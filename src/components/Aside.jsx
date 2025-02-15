import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';  // Assurez-vous que l'axios client est bien configuré
import logo_unit from '../assets/img/logo_unit.png';
import Modal from 'react-modal';
import io from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_SOCKET_URL}/video`); // Connexion au serveur socket.io

const Aside = ({ user, setUser, setToken }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formations, setFormations] = useState([]);  // Liste des formations pour le dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);  // État du dropdown "Planning"
  const [isDropdownOpenCertificat, setIsDropdownOpenCertificat] = useState(false);  // État du dropdown "Planning"
  const [isDropdownOpenInscription, setIsDropdownOpenInscription] = useState(false);  // État du dropdown "Planning"
  const [isEvaluationsDropdownOpen, setIsEvaluationsDropdownOpen] = useState(false); // Dropdown "Évaluations"
  const navigate = useNavigate();
  const [videoConferenceActive, setVideoConferenceActive] = useState(false);
  // const [videoConferenceActive, setVideoConferenceActive] = useState(false);
  const [roomName, setRoomName] = useState('defaultRoom'); // Exemple de room par défaut
  const [isConferenceStarted, setIsConferenceStarted] = useState(false);
  useEffect(() => {
    // Vérifier si une conférence est en cours dès que le composant se monte
    socket.emit('checkConferenceStatus', (isActive) => {
      setIsConferenceStarted(isActive); // Met à jour l'état si une conférence est active
    });

    // Nettoyage de la connexion socket lors du démontage du composant
    return () => {
      socket.off('checkConferenceStatus');
    };
  }, [socket]);
  
  
  // Vérification de l'état de la conférence après mise à jour
  useEffect(() => {
    console.log("Video conference state updated:", videoConferenceActive);
  }, [videoConferenceActive]);
  useEffect(() => {
    // Vérification du type d'utilisateur (formateur)
    const fetchFormations = async () => {
      try {
        // Si l'utilisateur est formateur, on appelle l'API Formation_formateur
        if (user.type === 'formateur') {
          const response = await axiosClient.get('/Formation_formateur');
          setFormations(response.data.results);
        } else {
          // Gestion des autres types d'utilisateurs (par exemple, apprenant ou admin)
          const url = user.type === 'admin' ? '/formations' : '/Formation_apprenant';
          const response = await axiosClient.get(url);
          setFormations(response.data.results);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error);
      }
    };

    fetchFormations();
  }, [user]);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmLogout = async (ev) => {
    ev.preventDefault();
    setIsLoggingOut(true);

    try {
      await axiosClient.post('/auth/logout');
      setUser(null);
      setToken(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setIsModalOpen(false);
      alert('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setIsModalOpen(false);
  };

  // Toggle du dropdown "Planning"
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDropdownCertificat = () => {
    setIsDropdownOpenCertificat(!isDropdownOpenCertificat);
  };
  const toggleDropdownInscription = () => {
    setIsDropdownOpenInscription(!isDropdownOpenInscription);
  };

  // Toggle du dropdown "Évaluations"
  const toggleEvaluationsDropdown = () => {
    setIsEvaluationsDropdownOpen(!isEvaluationsDropdownOpen);
  };

  return (
    <aside className="sidenav bg-white navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-4" id="sidenav-main">
      <div className="sidenav-header">
        <i className="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
        <NavLink className="navbar-brand m-0" to="" target="_blank" rel="noopener noreferrer">
          <img src={logo_unit} className="logo_aside" alt="main_logo" />
          <span className="ms-1 font-weight-bold">UN-IT</span>
        </NavLink>
      </div>
      <hr className="horizontal dark mt-0" />
      <div className=" w-auto mx-2" id="sidenav-collapse-main">
        <ul className="navbar-nav">
        <NavItem iconClass="fas fa-tachometer-alt text-dark" text="Accueil" to="/c/" end />

          {user.type === 'formateur' && (
            <>
              <NavItem iconClass="fas fa-book text-dark" text="Mes leçons" to="/c/Lesson_formateur" />
              <NavItem iconClass="fas fa-calendar-alt text-dark" text="Emploi du temps" to="/c/Planning_Formateur" />
              <NavItem iconClass="fas fa-user-check text-dark" text="Fiche de présence" to="/c/Presence_list" />
            </>
          )}

          {user.type === 'apprenant' && (
            <>
              <NavItem iconClass="fas fa-book text-dark" text="Formation" to="/c/Formation" />
              <NavItem iconClass="fas fa-book text-dark" text="Mes leçons" to="/c/Lesson_apprenant" />

            </>
          )}

          {user.type === 'admin' && (
            <>

            <NavItem iconClass="fas fa-user text-dark" text="Utilisateur" to="/c/User" />

              <NavItem iconClass="fas fa-chalkboard-teacher text-dark" text="Formation" to="/c/Formation" />
              <NavItem iconClass="fas fa-th text-dark" text="Module" to="/c/Module" />
              <NavItem iconClass="fas fa-graduation-cap text-dark" text="Matière" to="/c/course" />

              <NavItem iconClass="fas fa-chalkboard text-dark" text="Salle" to="/c/Room" />




              <li className={`nav-item custom-dropdown ${isDropdownOpenInscription ? 'open' : ''}`}>
              <span className="nav-link" onClick={toggleDropdownInscription}>
                <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="fas fa-file-signature text-dark"></i>
                </div>
                <span className="nav-link-text ms-1 me-1">Inscription apprenant</span>
                <i className={`fas ${isDropdownOpenInscription ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-icon`}></i>
              </span>
              {isDropdownOpenInscription && (
                <ul className="custom-dropdown-menu">
                  {formations.length > 0 ? (
                    formations.map((formation) => (
                      <li key={formation.id} className="custom-dropdown-item">
                        <NavLink to={`/c/InscriptionbyFomation/${formation.id}`}>{formation.name}</NavLink>
                      </li>
                    ))
                  ) : (
                    <>
                      {user.type === 'admin' && (
                        <li className="custom-dropdown-item">Aucune formation disponible</li>
                      )}
                      {user.type === 'apprenant' && (
                        <li className="custom-dropdown-item">Vous n'êtes pas encore inscrit à une formation</li>
                      )}
                    </>
                  )}
                </ul>
              )}
            </li>
            <li className={`nav-item custom-dropdown ${isDropdownOpenCertificat ? 'open' : ''}`}>
              <span className="nav-link" onClick={toggleDropdownCertificat}>
                <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="fas fa-certificate text-dark"></i>
                </div>
                <span className="nav-link-text ms-1">Certifcation </span>
                <i className={`fas ${isDropdownOpenCertificat ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-icon`}></i>
              </span>
              {isDropdownOpenCertificat && (
                <ul className="custom-dropdown-menu">
                  {formations.length > 0 ? (
                    formations.map((formation) => (
                      <li key={formation.id} className="custom-dropdown-item">
                        <NavLink to={`/c/CertificationbyFomation/${formation.id}`}>{formation.name}</NavLink>
                      </li>
                    ))
                  ) : (
                    <>
                      {user.type === 'admin' && (
                        <li className="custom-dropdown-item">Aucune formation disponible</li>
                      )}
                      {user.type === 'apprenant' && (
                        <li className="custom-dropdown-item">Vous n'êtes pas encore inscrit à une formation</li>
                      )}
                    </>
                  )}
                </ul>
              )}
            </li>
            </>
          )}

          {/* Dropdown pour "Planning" */}
          {(user.type === 'admin' || user.type === 'apprenant') && (
            <li className={`nav-item custom-dropdown ${isDropdownOpen ? 'open' : ''}`}>
              <span className="nav-link" onClick={toggleDropdown}>
                <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="fas fa-calendar text-dark text-sm opacity-10"></i>
                </div>
                <span className="nav-link-text ms-1">Emploi du temps </span>
                <i className={`fas ${isDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-icon`}></i>
              </span>
              {isDropdownOpen && (
                <ul className="custom-dropdown-menu">
                  {formations.length > 0 ? (
                    formations.map((formation) => (
                      <li key={formation.id} className="custom-dropdown-item">
                        <NavLink to={`/c/Planning_admin/formations/${formation.id}`}>{formation.name}</NavLink>
                      </li>
                    ))
                  ) : (
                    <>
                      {user.type === 'admin' && (
                        <li className="custom-dropdown-item">Aucune formation disponible</li>
                      )}
                      {user.type === 'apprenant' && (
                        <li className="custom-dropdown-item">Vous n'êtes pas encore inscrit à une formation</li>
                      )}
                    </>
                  )}
                </ul>
              )}
            </li>
          )}

{/* Dropdown pour "Évaluations" */}
{(user.type === 'formateur' || user.type === 'apprenant') && (
  <>
    <li className={`nav-item custom-dropdown ${isEvaluationsDropdownOpen ? 'open' : ''}`}>
      <span className="nav-link" onClick={toggleEvaluationsDropdown}>
        <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
          <i className="fas fa-clipboard-list text-dark text-sm opacity-10"></i>
        </div>
        <span className="nav-link-text ms-1">Évaluations</span>
        <i className={`fas ${isEvaluationsDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-icon`}></i>
      </span>
      {isEvaluationsDropdownOpen && (
        <ul className="custom-dropdown-menu">
          {formations.length > 0 ? (
            formations.map((formation) => (
              <li key={formation.id} className="custom-dropdown-item">
                <NavLink to={`/c/evaluations/formation/${formation.id}`}>{formation.name}</NavLink>
              </li>
            ))
          ) : (
            <li className="custom-dropdown-item">Aucune formation disponible</li>
          )}
        </ul>
      )}
    </li>

  {/* Navigation Item */}
  
      {/* Badge conditionnel à côté du texte "Vidéo Conférences" */}
      <div style={{ display: 'inline-block', position: 'relative' }}>
      <NavItem iconClass="fas fa-video text-dark" text="Vidéo Conférences" to="/c/VideoConference" />
    
        {isConferenceStarted && (
          <span
            style={{
              backgroundColor: 'red',
              color: 'white',
              padding: '0.2rem 0.5rem',
              borderRadius: '50%',
              fontSize: '0.8rem',
              position: 'absolute',
              top: '0px',
              right: '30px',
            }}
          >
            1
          </span>
        )}
      </div>
    <NavItem iconClass="fas fa-robot text-dark" text="Assistant IA" to="/c/Gemini_api" />
    <NavItem iconClass="fas fa-lightbulb text-dark" text="Communauté d'Entraide" to="/c/Forum" />
  </>
)}

          <li className="nav-item">
  <NavLink className="nav-link" to="/login" onClick={handleLogoutClick}>
    <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
      <i className="fas fa-sign-out-alt text-danger text-sm opacity-10"></i>
    </div>
    <span className="nav-link-text ms-1">Déconnecter</span>
  </NavLink>
</li>

        </ul>
      </div>

      {/* Modal pour la déconnexion */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancelLogout}
        contentLabel="Confirmation de déconnexion"
        overlayClassName="modal-overlay"
        className="customModal"
      >
        <div className="modal-header">
          <h4 className="modal-title">
            <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i> Déconnexion
          </h4>
       
        </div>

        <div className="modal-body">
          {isLoggingOut ? (
            <p>Déconnexion en cours...</p>
          ) : (
            <p>Voulez-vous vraiment vous déconnecter ?</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCancelLogout} disabled={isLoggingOut}>
            <i className="fas fa-ban"></i> Annuler
          </button>
          <button className="btn btn-danger" onClick={handleConfirmLogout} disabled={isLoggingOut}>
            <i className="fas fa-sign-out-alt"></i> Déconnecter
          </button>
        </div>
      </Modal>
    </aside>
  );
};

// Composant pour les éléments de la barre latérale
const NavItem = ({ iconClass, text, to }) => (
  <li className="nav-item">
    <NavLink 
  className={({ isActive }) => `nav-link ${isActive ? 'active green-bg' : ''}`}
  to={to}
  end
>

      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
        <i className={iconClass}></i>
      </div>
      <span className="nav-link-text ms-1">{text}</span>
    </NavLink>
  </li>
);

export default Aside;
