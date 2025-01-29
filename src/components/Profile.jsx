import React, { useEffect, useState,useRef } from 'react';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from "../axiosClient";
import team2 from "../assets/img/team-2.jpg";
import user_pr from "../assets/img/user.png";
import profile_bg from "../assets/img/bg-profile.jpg";
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { ClipLoader } from 'react-spinners';

const Profile = ({ user }) => {
  const { userId } = useParams();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileimage, setPhoto] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [facebook_link, setFacebook_link] = useState("");
  const [linkedin_link, setlinkedin_link] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // État pour le spinner
  const [mdpisModalOpen, mdpsetIsModalOpen] = useState(false); // Pour gérer l'état du modal
  const ws = useRef(null);
  // const { Id } = useParams();
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Fonction pour ouvrir le modal
  const openModal = () => {
    mdpsetIsModalOpen(true);
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
    mdpsetIsModalOpen(false);
  };
  useEffect(() => {
    const socket = new WebSocket(`wss://${import.meta.env.VITE_SOCKET_ONLINE_URL.replace(/^https?:\/\//, '')}`);

    socket.onopen = () => {
      if (userId) {
        console.log('Connected to WebSocket online_srv');
        socket.send(JSON.stringify({ userId }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'onlineUsers') {
        fetchOnlineUsers(data.users);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from server');
    };

    return () => socket.close();
  }, [userId]);

  const fetchOnlineUsers = async (userIds) => {
    try {
      const response = await axiosClient.get('/users');
      const usersOnline = response.data.filter(user => userIds.includes(user.id));
      setOnlineUsers(usersOnline);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  useEffect(() => {
    axiosClient.get('/users')
      .then(response => {
        setUsers(response.data);

        // Détermine l'ID de l'utilisateur cible : soit userId (profil d'un autre), soit user.id (profil personnel)
        const idToFind = userId ? userId : user.id;
        const foundUser = response.data.find(u => u.id.toString() === idToFind.toString()); // S'assure de la correspondance des types

        if (foundUser) {
          setSelectedUser(foundUser);
          setName(foundUser.name);
          setlinkedin_link(foundUser.linkedin_link);
          setFacebook_link(foundUser.facebook_link);
          setEmail(foundUser.email);
          setContact(foundUser.contact || '');
        } else {
          toast.error("Utilisateur non trouvé.");
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des utilisateurs :', error);
        toast.error('Erreur lors du chargement des utilisateurs.');
      });
  }, [userId, user.id]);
  const handleEditClick = () => {
    setIsModalOpen(true);
  };

    const handleResetPasswordClick = async (e) => {
    e.preventDefault();
   
    setLoading(true); // Afficher le spinner

    try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, { email });
        toast.success(response.data.message);
    } catch (err) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
    } finally {
        setLoading(false); // Masquer le spinner
        closeModal();
    }
  }
  
  const handleSave = (event) => {
    event.preventDefault();

    const formData = new FormData();
    if (fileimage) {
      formData.append('image', fileimage);
    }
    if (contact) {
      // Combiner l'indicatif du pays et le numéro de téléphone
      const fullContact = `+261 ${contact}`;
      formData.append('contact', fullContact);}
     formData.append('name', name);
     if (facebook_link) formData.append('facebook_link', facebook_link);
     if (linkedin_link) formData.append('linkedin_link', linkedin_link);
    formData.append('email', email);

    axiosClient.post(`/updateuser/${selectedUser.id}`, formData)
      .then(response => {
        const updatedUser = response.data.user;
        setUsers(prevUsers => 
          prevUsers.map(user => (user.id === updatedUser.id ? updatedUser : user))
        );
        setSelectedUser(updatedUser);
        setIsModalOpen(false);
        toast.success('Profile mis à jour avec succès !');
      })
      .catch(error => {
        console.error('Erreur lors de la mise à jour du profil :', error);
        toast.error('Erreur lors de la mise à jour du profil.');
      });
  };


  if (!selectedUser) {
    return <div>Chargement...</div>;
  }
  const handleMessagesClick = () => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="row">
       <Modal 
        isOpen={mdpisModalOpen} 
        onRequestClose={closeModal} 
                overlayClassName="modal-overlay"
        className="user-card-modal"
        contentLabel="Confirmation de réinitialisation"
        ariaHideApp={false} // Nécessaire pour éviter des erreurs d'accessibilité
      >
        <h3>Êtes-vous sûr de vouloir réinitialiser votre mot de passe ?</h3>
        <div className="mt-4">
        {loading ? (
                            <ClipLoader color="#36d7b7" size={35}             className="me-4"/> 
                        ) : (
          <button 
            className="btn btn-success btn-sm me-4"
            onClick={handleResetPasswordClick} // Confirmer la réinitialisation
          >
            Oui, réinitialiser
          </button>
)}
          <button 
            className="btn btn-secondary btn-sm ml-2"
            onClick={closeModal} // Fermer le modal sans rien faire
          >
            Non, annuler
          </button>
        </div>
      </Modal>
      <Modal
        overlayClassName="modal-overlay"
        className="user-card-modal"
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <div className="user-card-container">
          <div className="user-card-header">
            <div className="user-avatar">
            {fileimage ? (
  <img 
    src={fileimage instanceof File ? URL.createObjectURL(fileimage) : `${import.meta.env.VITE_API_BASE_URL}/uploads/${fileimage}`} 
    alt="User Profile" 
    className="user-image" 
  />
) : selectedUser.image ? (
  <img 
    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${selectedUser.image}`} 
    alt="User Profile" 
    className="user-image" 
  />
) : (
  <div className="user-image-placeholder">+</div>
)}

            </div>
            <h2 className="user-card-title">Modifier le profil</h2>
          </div>

          <form onSubmit={handleSave} className="user-card-form">
            <div className="user-card-input-group">
              <label htmlFor="username" className="user-label">Nom</label>
              <input 
                type="text" 
                id="username" 
                className="user-input" 
                placeholder="Nom de l'utilisateur" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="user-card-input-group">
              <label htmlFor="email" className="user-label">Email</label>
              <input 
                type="email" 
                id="email" 
                className="user-input" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                // required 
              />
            </div>

            <div className="user-card-input-group">
    <label htmlFor="contact" className="user-label">Numéro de téléphone 🇲🇬 (Contact professionnel)</label>
    <div className="phone-input-group d-flex align-items-center mb-3">
    <span className="country-code me-2" style={{ fontSize: "1rem", lineHeight: "1.5" }}>
        +261
    </span>
 <input
    type="tel"
    id="contact"
    className="form-control"
    placeholder="Ex : 348 655 523"
    value={contact}
    onChange={(e) => setContact(e.target.value)}
    pattern="^[0-9]{9}$"   // Limite à 9 chiffres
    maxLength="9"          // Empêche l'utilisateur de saisir plus de 9 chiffres
/>

</div>

   
</div>

            <div className="user-card-input-group">
              <label htmlFor="fileInput" className="user-label">Photo</label>
              <input 
                type="file" 
                id="fileInput" 
                className="user-file-input" 
                onChange={(e) => setPhoto(e.target.files[0])} 
              />
            </div>
            <div className="user-card-input-group">
              <label htmlFor="username" className="user-label">Lien facebook</label>
              <input 
                type="text" 
                id="username" 
                className="user-input" 
                placeholder="facebook" 
                value={facebook_link} 
                onChange={(e) => setFacebook_link(e.target.value)} 
                // required 
              />
            </div>
            <div className="user-card-input-group">
              <label htmlFor="username" className="user-label">Lien linkedin</label>
              <input 
                type="text" 
                id="username" 
                className="user-input" 
                placeholder="linkedin" 
                value={linkedin_link} 
                onChange={(e) => setlinkedin_link(e.target.value)} 
                // required 
              />
            </div>

            <div className="user-card-footer">
            <button
  type="button"
  className="user-card-button user-card-button-cancel"
  onClick={() => setIsModalOpen(false)}
>
  <i className="fas fa-times" style={{ marginRight: '5px' }}></i> Annuler
</button>
<button
  type="submit"
  className="user-card-button user-card-button-save"
>
  <i className="fas fa-edit" style={{ marginRight: '5px' }}></i> Modifier
</button>

            </div>
          </form>
        </div>
      </Modal>
      <div className="col-12 col-md-8 col-lg-6 mx-auto">
  <div className="card card-profile shadow-lg border-0 rounded-lg overflow-hidden" style={{ backgroundColor: 'white' }}>
    {/* Profile Background Image */}
    <img 
      src="https://zamilanetours.com/wp-content/uploads/2023/07/fianarantsoa-capitale.jpg" 
      alt="Profile background" 
      className="card-img-top rounded-0" 
      style={{ height: '400px', objectFit: 'cover' }} 
    />
    
    {/* Profile Image - Centré horizontalement */}
    <div className="row justify-content-center mt-n10">
      <div className="col-6 col-md-4  d-flex justify-content-center">
        <div className="position-relative">
          <img
            src={selectedUser.image ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${selectedUser.image}` : user_pr}
            className="rounded-circle img-fluid border-5 border-white shadow-lg"
            alt="Profile"
            style={{ maxWidth: '160px', border: '5px solid white', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s ease' }}
          />
        
        </div>
      </div>
    </div>

    {/* Card Header with Edit and Message Buttons */}
    <div className="card-header text-center border-0 pt-0 pb-3 pt-lg-4">
    <div className="d-flex justify-content-between">
  {userId && userId.toString() !== user.id.toString() ? (
    // Affiche le bouton "Message" si on visite le profil de quelqu'un d'autre
    <>    <a 
      href="#" 
      onClick={() => handleMessagesClick(userId)}  // Utilise une fonction fléchée pour appeler handleMessagesClick
      className="btn btn-dark btn-sm  mt-2"
      style={{ transition: 'background-color 0.3s' }}
    >
      <i className="fas fa-paper-plane"></i> Message
    </a>

<div className="custom-chat-status">
{onlineUsers.some(user => user.id == userId) ? (
  <>
    <span className="custom-status-indicator online"></span>
    <span className="custom-status-text-dark">En ligne</span>
  </>
) : (
  <>
    <span className="custom-status-indicator offline"></span>
    <span className="custom-status-text-dark">Hors ligne</span>
  </>
)}
</div>
</>

  ) : (
    <>   
    <button 
      className="btn btn-info btn-sm mt-2 "
      onClick={handleEditClick}
      style={{ transition: 'background-color 0.3s' }}
    >
      <i className="fas fa-edit"></i> Editer mon Profil
    </button>
  
  <button 
  className="btn btn-danger btn-sm ms-2 mt-2"
  onClick={openModal}
>
  <i className="fas fa-key"></i> Restaurer mot de passe
</button>
                      
</>

  )}
</div>


    </div>
<center>
    {/* Profile Body */}
    <h5 className="h3 font-weight-bold text-dark mt-0 mb-0">{selectedUser.name}</h5>
      <p className="text-muted mb-1">{selectedUser.email}</p>
      <div className="d-flex justify-content-center mb-3">
        {/* Contact */}
        {selectedUser.contact && (
          <div className="mx-3">
            <i className="fas fa-phone-alt text-info" style={{ fontSize: '1.2rem' }}></i>
            <p className="description text-dark">🇲🇬 +261 {selectedUser.contact}</p>
          </div>
        )}
        {/* User Type */}
        {selectedUser.type && (
          <div className="mx-3">
            <i className="fas fa-user-tag text-warning" style={{ fontSize: '1.2rem' }}></i>
            <p className="description text-dark">{selectedUser.type}</p>
          </div>
        )}
      </div>

      {/* Social Links */}
      <div className="d-flex justify-content-center mb-0">
        <a href={selectedUser.facebook_link} className="btn btn-outline-primary btn-icon-only mx-2" style={{ borderRadius: '50%', padding: '10px' }}>
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href={selectedUser.facebook_link} className="btn btn-outline-info btn-icon-only mx-2" style={{ borderRadius: '50%', padding: '10px' }}>
          <i className="fab fa-linkedin"></i>
        </a>
      </div>
      </center>
  </div>
</div>

{/* Style (Optional) */}
<style jsx>{`
  .card-profile {
    background-color: white;
    transition: all 0.3s ease;
  }

  .card-profile:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  }

  .btn:hover {
    background-color: #0056b3 !important;
    color: white !important;
  }

  .badge {
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
`}</style>



      <ToastContainer />
    </div>
  );
};

export default Profile;
