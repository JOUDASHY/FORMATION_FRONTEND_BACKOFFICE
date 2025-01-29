import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Online_user from './Online_user.jsx';
import axiosClient from '../axiosClient.js';
import Swal from 'sweetalert2';


const MessageList = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]); // Stocker les formations
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const [selectedFormation, setSelectedFormation] = useState(''); // Formation sélectionnée
  const [messageContent, setMessageContent] = useState(''); // Message à envoyer
  const [attachment, setAttachment] = useState(null);

  // Récupérer les formations depuis l'API
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        // Vérifier le type d'utilisateur et choisir l'endpoint en conséquence
        const endpoint = user.type === 'formateur' ? '/Formation_formateur' : '/formations';
        
        // Faire la requête API selon l'endpoint choisi
        const response = await axiosClient.get(endpoint);
    
        // Mettre à jour l'état avec les formations récupérées
        setFormations(response.data.results);
      } catch (error) {
        console.error("Erreur lors de la récupération des formations :", error);
      } finally {
        setLoading(false);  // Terminer le chargement
      }
    };
    

    fetchFormations();
  }, [axiosClient]);
  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  // Gérer l'envoi de message
  const handleSendMessageToFormation = async (e) => {
    e.preventDefault();
  
    if (!selectedFormation ) {
      Swal.fire({
        icon: 'warning',
        title: 'Champ manquant',
        text: 'Veuillez sélectionner une formation et écrire un message.',
        confirmButtonColor: '#0061ff',
      });
      return;
    }
  
    console.log('attach : ', attachment);
  
    // Créer un FormData pour envoyer les données avec un fichier
    const formData = new FormData();
    formData.append('formation_id', selectedFormation);
    formData.append('sender_id', user.id);
    formData.append('message', messageContent);
    
    if (attachment) {
      formData.append('attachment', attachment);
    }
  
    try {
      const response = await axiosClient.post('/sendMessageFormation', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Si l'API retourne une réponse d'erreur
      if (response.data.status === 'No learners found for this formation') {
        Swal.fire({
          icon: 'warning',
          title: 'Aucun étudiant inscrit',
          text: response.data.message || 'Il n\'y a actuellement aucun étudiant inscrit à cette formation.',
          confirmButtonColor: '#ff851b',
        });
        return;
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Message envoyé avec succès !',
        confirmButtonColor: '#28a745',
      });
  
      // Réinitialiser les champs
      setMessageContent('');
      setSelectedFormation('');
      setAttachment(null);
  
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
  
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || "Une erreur s'est produite. Veuillez réessayer.",
        confirmButtonColor: '#dc3545',
      });
    }
  };
  
  
  

  // const handleClear = () => setSearchQuery('');
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosClient.get(`/conversations?user_id=${user.id}`);
        setMessages(response.data);
        setFilteredMessages(response.data); // Initialiser les messages filtrés

        const allUserIds = [...new Set(response.data.flatMap((message) => [message.sender_id, message.receiver_id]))];
        
        const userDetails = await Promise.all(
          allUserIds.map(async (id) => {
            const userResponse = await axiosClient.get(`/users/${id}`);
            return { id, ...userResponse.data };
          })
        );

        const userMap = {};
        userDetails.forEach((user) => {
          userMap[user.id] = user;
        });
        setUsers(userMap);
      } catch (error) {
        console.error('Error fetching messages or user details:', error);
      }
    };

    fetchMessages();
  }, [user.id]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };


  // Fonction pour lancer la recherche
  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredMessages(messages); // Si recherche vide, réinitialiser les messages
    } else {
      const results = messages.filter((message) => {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const otherUser = users[otherUserId];
        return (
          otherUser &&
          otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredMessages(results);
    }
  };

  // Fonction pour réinitialiser la recherche
  const handleClear = () => {
    setSearchQuery('');
    setFilteredMessages(messages); // Réinitialiser les messages à leur état original
  };
  const handleMessagesClick = async (otherUserId) => {
    navigate(`/chat/${otherUserId}`);
  
    // Filtrer les messages non lus de cet utilisateur
    const unreadMessages = messages.filter(
      (message) => 
        message.sender_id === otherUserId && 
        !message.is_read
    );
  
    // Marquer chaque message non lu comme "lu"
    try {
      await Promise.all(
        unreadMessages.map((message) =>
          axiosClient.put(`/messages/${message.id}/read`)
        )
      );
  
      // Mettre à jour l'état local pour refléter le changement
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          unreadMessages.some((unreadMsg) => unreadMsg.id === msg.id)
            ? { ...msg, is_read: true }
            : msg
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour des messages :", error);
    }
  };
  const handleProfilClick = (receiver) => {
    console.log(receiver); // Vérifiez que vous obtenez l'objet correct dans la console
    navigate(`/profile/${receiver.id}`);
  };
  
  
  return (
<div className="row mt-4">
  <div className="col-lg-8 mb-lg-0 mb-4 message-container">
    <h1 className="text-center mb-4">Messages</h1>

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

    {/* Liste des messages */}
    <div className="list-group py-3">
      {filteredMessages.map((message) => {
        const otherUserId =
          message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const otherUser = users[otherUserId];

        return (
          <div
            key={message.id}
            className="list-group-item list-group-item-action d-flex align-items-center py-3"
            onClick={() => handleMessagesClick(otherUserId)}
          >
            {/* Avatar */}
            <div className="me-3">
              {otherUser ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${otherUser.image}`}
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: '50px', height: '50px' }}
                />
              ) : (
                <div
                  className="placeholder-avatar rounded-circle"
                  style={{ width: '50px', height: '50px' }}
                />
              )}
            </div>

            {/* Contenu du message */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center">
                <strong>
                  {otherUser ? otherUser.name : `User ${otherUserId}`}
                </strong>
                <small className="text-muted">
                  {formatTime(message.created_at)}
                </small>
              </div>
              {/* Message en gras si non lu et envoyé par le sender */}
              <p
                className={`mb-0 ${
                  !message.is_read && message.sender_id === otherUserId
                    ? "fw-bold"
                    : "text-muted"
                }`}
                style={{ fontSize: "0.875rem" }}
              >
                {message.message}
              </p>
            </div>

            {/* Badge ou Label "Vu" */}
            <div className="ms-3 text-end">
  {message.sender_id === user.id ? (
    message.is_read ? (
      <span className="badge bg-secondary">Vu</span>
    ) : (
      <i className="fas fa-arrow-right"></i>
    )
  ) : null}
</div>

          </div>
        );
      })}
    </div>
  </div>
    {/* Liste des utilisateurs en ligne */}
    <div className="col-lg-4">
    <Online_user currentuser={user} />



    {/* Section pour envoyer un message à une formation */}
    {user.type !== 'apprenant' && (
  <div className="card mt-4 shadow-lg border-0 rounded-4">
  <div
    className="card-header text-white text-center"
    style={{
      background: "",
      borderTopLeftRadius: "1rem",
      borderTopRightRadius: "1rem",
    }}
  >
    <h4 className="text-center mb-4">Envoyer un message groupe par formation</h4>
  </div>
  <div className="card-body p-4">
    <form onSubmit={handleSendMessageToFormation}>
      <div className="mb-4">
        <label htmlFor="formation" className="form-label fw-bold text-primary">
          Sélectionner une formation
        </label>
        <select
          id="formation"
          className="form-select border-0 shadow-sm rounded-3"
          style={{
            height: "3rem",
            backgroundColor: "#f7f9fc",
          }}
          value={selectedFormation}
          onChange={(e) => setSelectedFormation(e.target.value)}
          required
        >
          <option value="" disabled>
            -- Choisir une formation --
          </option>
          {formations.map((formation) => (
            <option key={formation.id} value={formation.id}>
              {formation.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="message" className="form-label fw-bold text-primary">
          Message
        </label>
        <div className="file-upload-wrapper ms-3 me-3">
            <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
              <i className="fa fa-paperclip fa-lg"></i>
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*"
              style={{ display: "none" }}
            />
          </div>
        <textarea
          id="message"
          className="form-control border-0 shadow-sm rounded-3"
          style={{
            height: "6rem",
            backgroundColor: "#f7f9fc",
          }}
          rows="4"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          // required
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-100 shadow-sm"
        style={{
          background: "#085a94",
          border: "none",
          height: "3rem",
          fontSize: "1.1rem",
          fontWeight: "bold",
        }}
      >
        Envoyer
      </button>
    </form>
  </div>
</div>

)}

  </div>
</div>



  );
};

export default MessageList;
