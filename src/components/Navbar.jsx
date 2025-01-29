import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axiosClient from '../axiosClient';
import NotificationDropdown from "./NotificationDropdown.jsx";
import Recherche_user from './Recherche_user.jsx';
import user_pr from "../assets/img/user.png"
// Configuration du point d'attache du modal
Modal.setAppElement('#root');

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond sombre et flou
    backdropFilter: 'blur(4px)', // Applique un effet de flou
    zIndex: 1000,
  },
  content: {
    top: '12%',    // Positionne le modal en haut de l'écran
    left: 'auto',  // Permet au modal de se caler à droite
    right: '0',    // Positionne le modal au bord droit
    bottom: 'auto',
    transform: 'translateY(0)', // Annule le centrage vertical
    width: '84%',  // Ajuste la largeur du modal
    maxHeight: '80vh',  // Limite la hauteur du modal
    borderRadius: '20px',
    overflow: 'auto',
  },
};


const Navbar = ({user}) => {
  // const [user, setUser] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  // const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('');

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axiosClient.get(`/CountConversationsNotRead?user_id=${user.id}`);
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [user.id]);
  const handleNavClick = (nav) => {
    setActiveNav(nav);
  };

  const handlePaymentHistoryClick = () => {
    closeSearchModal();

    setActiveNav("history"); // Marquer l'élément comme actif
    navigate("/Payment_history"); // Rediriger vers l'historique des paiements
  };
  const handleMessagesClick = (Id) => {

      navigate(`/chat/${Id}`);
       closeSearchModal();
  };

  const navMessageClick = () => {
    closeSearchModal();
      navigate(`/MessageList`);
  };
  const navProfilClick = () => {
    closeSearchModal();
    navigate('/profile');
  };
  const navProfil_userClick  = (Id) => {
    closeSearchModal();
    navigate(`/profile/${Id}`);
  };
  const handleCallClick = (userId) => {
    closeSearchModal();
      
      navigate(`/call/${userId}`);
  };
  
  useEffect(() => {
      (async () => await Load())();
  }, []);

  async function Load() {
      try {
          const result = await axiosClient.get("/users");
          if (Array.isArray(result.data)) {
              setUsers(result.data);
          } else {
              setUsers([]);
          }
      } catch (error) {
          console.error("Erreur lors du chargement des utilisateurs:", error);
          setUsers([]);
      }
  }

  const handleSearch = () => {
      if (searchQuery.trim() === '') {
          setFilteredUsers([]);
      } else {
          const results = users.filter(user =>
              user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (user.type && user.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (user.contact && user.contact.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setFilteredUsers(results);
      }
  };

  // Gestion du sidenav (partie existante)
  useEffect(() => {
    const iconNavbarSidenav = document.getElementById('iconNavbarSidenav');
    const iconSidenav = document.getElementById('iconSidenav');
    const sidenav = document.getElementById('sidenav-main');
    const body = document.body;
    const className = 'g-sidenav-pinned';

    const toggleSidenav = () => {
      if (body.classList.contains(className)) {
        body.classList.remove(className);
        setTimeout(() => {
          sidenav.classList.remove('bg-white');
        }, 100);
        sidenav.classList.remove('bg-transparent');
      } else {
        body.classList.add(className);
        sidenav.classList.add('bg-white');
        sidenav.classList.remove('bg-transparent');
        if (iconSidenav) {
          iconSidenav.classList.remove('d-none');
        }
      }
    };

    if (iconNavbarSidenav) {
      iconNavbarSidenav.addEventListener("click", toggleSidenav);
    }

    let html = document.documentElement;
    html.addEventListener("click", (e) => {
      if (body.classList.contains(className) && !e.target.classList.contains('sidenav-toggler-line')) {
        body.classList.remove(className);
      }
    });

    return () => {
      if (iconNavbarSidenav) {
        iconNavbarSidenav.removeEventListener("click", toggleSidenav);
      }
      html.removeEventListener("click", toggleSidenav);
    };
  }, []);
  const handleClear = () => {
      setSearchQuery('');
      setFilteredUsers([]);
  };
  useEffect(() => {
    // const fetchUserProfile = async () => {
    //   try {
    //     const response = await axiosClient.get("${import.meta.env.VITE_API_BASE_URL}/api/auth/me");
    //     if (response.data.status === "success" && response.data.user) {
    //       setUser(response.data.user);
    //     } else {
    //       setUser(null); // ou une valeur par défaut
    //     }
    //   } catch (error) {
    //     console.error("Erreur lors de la récupération des informations utilisateur :", error);
    //     setUser(null); // Assurez-vous de gérer l'erreur en réinitialisant ou en affichant une valeur par défaut
    //   }
    // };
    

    const fetchNotifications = async () => {
      try {
        const response = await axiosClient.get("/notifications/unread");
        setNotificationCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications :", error);
      }
    };

    // fetchUserProfile();
    fetchNotifications();
  }, []);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  return (
    <nav className="navbar navbar-main navbar-expand-lg px-0 my-3 mx-1 shadow-none sticky-top border-radius-xl" id="navbarBlur" data-scroll="false">
      <div className="container-fluid py-1 px-3">
        <div className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
        <ul className="navbar-nav d-flex w-100 h-100 justify-content-between">
  {/* Bouton pour ouvrir le Sidenav */}
  <li className="nav-item d-xl-none ps-3 d-flex align-items-center me-4">
    <a href="#" className="nav-link text-white p-0" id="iconNavbarSidenav">
      <div className="sidenav-toggler-inner">
        <i className="sidenav-toggler-line bg-white"></i>
        <i className="sidenav-toggler-line bg-white"></i>
        <i className="sidenav-toggler-line bg-white"></i>
      </div>
    </a>
  </li>

  {/* Profil utilisateur */}
  <li
    className={`nav-item d-flex align-items-center w-100 px-2 py-2 ${
      activeNav === "profil" ? "text-light fs-5" : "text-white"
    }`}
    onClick={() => {
      handleNavClick("profil");
      navProfilClick();
    }}
    style={{ cursor: "pointer" }}
  >
    {user && (
      <>

<img
            src={user.image ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${user.image}` : user_pr}
            
            alt="Profile"
            className="rounded-circle"
            style={{ width: "35px", height: "35px", marginRight: "10px" }}
          />
        {/* <img
          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${user.image}`}
          alt={user.name}
          className="rounded-circle"
          style={{ width: "35px", height: "35px", marginRight: "10px" }}
        /> */}
        <span className="d-none d-md-inline">{user.name}</span>
      </>
    )}
  </li>

  {/* Messages */}
  <li
      className={`nav-item d-flex align-items-center w-100 px-2 py-2 ${
        activeNav === "messages" ? "text-light fs-5" : "text-white"
      }`}
      onClick={() => {
        handleNavClick("messages");
        navMessageClick();
      }}
      style={{ cursor: "pointer" }}
    >
      <i className="fas fa-envelope me-1"></i>
          {/* Affichage du badge */}
          {unreadCount > 0 && (
        <span
          className="badge bg-danger "
          style={{
            position: "relative",
            top: "-8px",
            left: "-6px",
            fontSize: "0.75rem",
            lineHeight: "1.5",
            borderRadius: "12px",
            padding: "2px 6px",
          }}
        >
          {unreadCount}
        </span>
      )}
      <span className=" d-none d-md-inline ms">Messages</span>

  
    </li>

  {/* Rechercher */}
  <li
    className={`nav-item d-flex align-items-center w-100 px-2 py-2 ${
      activeNav === "search" ? "text-light fs-5" : "text-white"
    }`}
    onClick={() => {
      handleNavClick("search");
      openSearchModal();
    }}
    style={{ cursor: "pointer" }}
  >
    <i className="fas fa-search"></i>
    <span className="ms-2 d-none d-md-inline">Rechercher</span>
  </li>

  {/* Historique des paiements */}
  {user.type !== "formateur" && (
    <li
      className={`nav-item d-flex align-items-center w-100 px-2 py-2 ${
        activeNav === "history" ? "text-light fs-5" : "text-white"
      }`}
      onClick={handlePaymentHistoryClick} // Gestion du clic pour redirection
      style={{ cursor: "pointer" }}
    >
      <i className="fas fa-history"></i>
      <span className="ms-2 d-none d-md-inline">Historique des paiements</span>
    </li>
  )}

  {/* Notifications */}
  <li
    className={`nav-item d-flex align-items-center position-relative w-100 px-2 py-2 ${
      activeNav === "notifications" ? "text-light fs-5" : "text-white"
    }`}
    onClick={() => handleNavClick("notifications")}
    style={{ cursor: "pointer" }}
  >
    <NotificationDropdown notificationCount={notificationCount} />
    <span className="ms-2 d-none d-md-inline">Notifications</span>
    {notificationCount > 0 && (
      
      <span
      className="badge bg-danger ms-2"
      style={{
        position: "relative",
        top: "-8px",
        left: "-6px",
        fontSize: "0.75rem",
        lineHeight: "1.5",
        borderRadius: "12px",
        padding: "2px 6px",
      }}
    >
   {notificationCount}
    </span>
    )}
  </li>
</ul>









        </div>
      </div>

      <Modal
        isOpen={isSearchModalOpen}
        onRequestClose={closeSearchModal}
        contentLabel="Recherche Utilisateur"
        ariaHideApp={false}
        style={customStyles}
      >
        <button type="button" className="close" onClick={closeSearchModal}>
          <i className="fas fa-times"></i>
        </button>
        <h4>Recherche des utilisateurs</h4>
        <div className="container-fluid ">
            {/* <h1>Rechereche des utilisateurs</h1> */}
            <div className="recent-orders">
                <div className="search-bar-user">
                    {searchQuery && (
                        <button className="clear-btn-user" onClick={handleClear}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                    <input
                        type="text"
                        placeholder="Rechercher par nom, type, email ou contact"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input-user"
                    />
                    <button className="search-btn-user" onClick={handleSearch}>
                        <i className="fas fa-search"></i>
                    </button>
                </div>

                {filteredUsers.length > 0 ? (
    filteredUsers.map(user_results => (
      <div key={user_results.id} className="card shadow-lg mx-2 my-2 card-profile-bottom">
          <div className="card-body p-2">
              <div className="row gx-2">
               
                      <div className="col-auto">
                      <a 
                      href="#"
                      onClick={(e) => {
                          e.preventDefault(); // Empêche le lien de recharger la page
                          navProfil_userClick(user_results.id);
                      }}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                          <div className="avatar avatar-xl position-relative">
                              <img
                                  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${user_results.image}`}
                                  alt={user_results.name}
                                  className="w-100 border-radius-lg shadow-sm"
                              />
                          </div>
                          </a>

                      </div>
                      <div className="col-auto my-auto">
                      <a 
                      href="#"
                      onClick={(e) => {
                          e.preventDefault(); // Empêche le lien de recharger la page
                          navProfil_userClick(user_results.id);
                      }}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                          <div className="h-100">
                              <h5 className="mb-1">{user_results.name} ({user_results.type})</h5>
                              <p className="mb-0 text-sm">{user_results.email}</p>
                          </div>
                          </a>
                      </div>
                  
                  <div className="col-lg-4 col-md-6 my-sm-auto ms-sm-auto me-sm-0 mx-auto mt-1">
                      <div className="nav-wrapper position-relative end-0">
                          <ul className="nav nav-pills nav-fill p-1" role="tablist">
                              <li className="nav-item">
                                  <a 
                                      className="nav-link mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                      onClick={() => handleCallClick(user_results.id)}
                                      style={{ cursor: 'pointer' }}
                                  >
                                      <i className="ni ni-mobile-button"></i>
                                      <span className="ms-2">Appel</span>
                                  </a>
                              </li>
                              <li className="nav-item">
                                  <a 
                                      className="nav-link mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                      onClick={() => handleMessagesClick(user_results.id)}
                                      style={{ cursor: 'pointer' }}
                                  >
                                      <i className="ni ni-email-83"></i>
                                      <span className="ms-2">Messages</span>
                                  </a>
                              </li>
                              
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  ))
  
                ) : (
                    <p>Aucun utilisateur trouvé</p>
                )}
            </div>
            </div>
      </Modal>
    </nav>
  );
};

export default Navbar;
