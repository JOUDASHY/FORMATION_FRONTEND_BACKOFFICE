import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useNavigate } from 'react-router-dom';


const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);
  const { Id } = useParams();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const userId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    const socket = new WebSocket(`wss://${import.meta.env.VITE_SOCKET_ONLINE_URL.replace(/^https?:\/\//, '')}`);

    socket.onopen = () => {
      if (userId) {
        console.log('Connected to WebSocket');
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
    ws.current = new WebSocket(`wss://${import.meta.env.VITE_SOCKET_MSG_URL.replace(/^https?:\/\//, '')}`);

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ userId: user.id }));
    };

    ws.current.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
      
        if (messageData.sender_id === Id) {
          displayMessage(messageData);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    
    fetchMessages();
    fetchReceiver();

    return () => {
      ws.current.close();
    };
  }, [user, Id]);
  const handleProfilClick = (receiver) => {
    console.log(receiver); // Vérifiez que vous obtenez l'objet correct dans la console
    navigate(`/profile/${receiver.id}`);
  };

  
  const fetchMessages = async () => {
    try {
      const response = await axiosClient.get('/messages', {
        params: { sender_id: user.id, receiver_id: Id },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    }
  };

  const fetchReceiver = async () => {
    try {
      const response = await axiosClient.get(`/users/${Id}`);
      setReceiver(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur récepteur:', error);
    }
  };

  const displayMessage = (messageData) => {
    setMessages((prevMessages) => [...prevMessages, messageData]);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (messageInput.trim() !== '' || attachment) { // Assurez-vous qu'il y a soit un message soit un fichier
        const formData = new FormData();
        formData.append('sender_id', user.id);
        formData.append('receiver_id', Id);
        formData.append('message', messageInput);

        if (attachment && attachment.name) { // Vérifiez si l'attachement est valide
            formData.append('attachment', attachment);
        }

        try {
            const response = await axiosClient.post('/messages/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Récupération du message renvoyé par le serveur
            const { message, attachmentUrl } = response.data; // Le serveur doit renvoyer l'objet message et l'URL du fichier

            // Création du message avec l'URL de l'attachement
            const newMessage = {
                sender_id: user.id,
                receiver_id: Id,
                message: messageInput,
                attachment: attachmentUrl, // Utilisation de l'URL renvoyée par le serveur
            };

            // Mise à jour de l'état des messages
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            // Réinitialisation
            setMessageInput('');
            setAttachment(null); 

        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
        }
    }
};



  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  return (
    <div className="custom-chat-wrapper">
      <div className="custom-chat-box">
        <div className="custom-chat-header">
          {receiver && (
            <>
           <img
  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${receiver.image}`}
  alt={receiver.name}
  className="custom-chatbot-image"
  onClick={(e) => handleProfilClick(receiver, e)} // Passe l'événement au handler
/>

              <div className="custom-receiver-info">
                <div className='chat-name' onClick={(e) => handleProfilClick(receiver, e)}>{receiver.name}</div>
                <span className="custom-receiver-type">{receiver.type}</span>
              </div>
              <div className="custom-chat-status">
                {onlineUsers.some(user => user.id === receiver.id) ? (
                  <>
                    <span className="custom-status-indicator online"></span>
                    <span className="custom-status-text">En ligne</span>
                  </>
                ) : (
                  <>
                    <span className="custom-status-indicator offline"></span>
                    <span className="custom-status-text">Hors ligne</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="custom-messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`custom-message-bubble ${message.sender_id === user.id ? 'custom-sent' : 'custom-received'}`}
            >
              {message.sender_id !== user.id && receiver && (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${receiver.image}`}
                  alt={receiver.name}
                  className="custom-receiver-avatar"
                />
              )}
              <span className="custom-message-sender">
                {message.sender_id === user.id ? '' : message.sender_name}
              </span>
              <p className="custom-message-text">{message.message}</p>

              {message.attachment && (
                <div className="custom-message-attachment">
                  {typeof message.attachment === 'string' && ['jpg', 'jpeg', 'png'].includes(message.attachment.split('.').pop()) ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/storage/message/${message.attachment}`}
                      alt="Fichier attaché"
                      className="custom-attachment-image"
                    />
                  ) : typeof message.attachment === 'string' && message.attachment.split('.').pop() === 'pdf' ? (
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL}/storage/message/${message.attachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="custom-attachment-link"
                    >
                      <i className="custom-attachment-icon">📄</i> Télécharger le PDF
                    </a>
                  ) : typeof message.attachment === 'string' && ['mp4', 'webm', 'ogg'].includes(message.attachment.split('.').pop()) ? (
                    <div className="custom-attachment-video">
                      <video
                        controls
                        src={`${import.meta.env.VITE_API_BASE_URL}/storage/message/${message.attachment}`}
                        className="custom-video-player"
                      >
                        Votre navigateur ne supporte pas la lecture de vidéos.
                      </video>
                    </div> ): typeof message.attachment === 'string' ? (
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL}/storage/message/${message.attachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="custom-attachment-link"
                    >
                      <i className="custom-attachment-icon">📎</i> Télécharger le fichier
                    </a>
                  ) : (
                    <span>Fichier attaché inconnu</span>
                  )}
                </div>
              )}

              <span className="custom-message-time">
                {message.created_at && message.created_at.trim() !== "" && !isNaN(Date.parse(message.created_at))
                  ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : "À l'instant"}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="custom-message-input-container">
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
          <input
            type="text"
            className="custom-message-input"
            placeholder="Tapez votre message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
      
          <button
            className="custom-send-button"
            onClick={sendMessage}
          >
            <i className="custom-send-icon">➤</i>
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default Chat;
