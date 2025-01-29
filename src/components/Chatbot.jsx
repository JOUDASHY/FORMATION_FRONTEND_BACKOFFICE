import React, { useState, useRef } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners'; // Import du spinner

const Chatbot = ({ receiver, user }) => {
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  // const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false); // État pour le spinner

  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    setLoading(true);
    setMessages([...messages, { sender_id: user.id, message: messageInput }]);
    setMessageInput('');

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistral",
          prompt: messageInput,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finalResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const parsedChunk = JSON.parse(chunk);
        finalResponse += parsedChunk.response;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender_id: 0, message: finalResponse }, // Message du chatbot
      ]);
    } catch (error) {
      console.error("Erreur lors de la requête à Mistral:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender_id: 0, message: "Erreur : impossible de générer une réponse." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
<div className="custom-chat-wrapper">
  <div className="custom-chat-box">
    <div className="custom-chat-header">
      <>
        <img
          src="https://media.istockphoto.com/id/1445426863/fr/vectoriel/concept-de-conception-de-logo-vectoriel-chat-bot.jpg?s=612x612&w=0&k=20&c=HMIHtjqCnZ0ajOCUrJnHlaAh8Fj1_ubPieZ1P9unoWo="
          alt="Chatbot"
          className="custom-chatbot-image"
        />
        <div className="custom-receiver-info">
          <div className='chat-name'>Assistant IA ChatBOT (Ollama MISTRAL)</div>
          <span className="custom-receiver-type"></span>
        </div>
        <div className="custom-chat-status">
          <span className="custom-status-indicator online"></span>
          <span className="custom-status-text">En ligne</span>
        </div>
      </>
    </div>

    <div className="custom-messages-container">
      {messages.map((message, index) => (
        <div key={index} className={`custom-message-bubble ${message.sender_id === user.id ? 'custom-sent' : 'custom-received'}`}>
          {message.sender_id !== user.id && receiver && (
            <img 
              src={`http://127.0.0.1:8000/uploads/${receiver.image}`} 
              alt={receiver.name} 
              className="custom-receiver-avatar"
            />
          )}
          <span className="custom-message-sender">
            {message.sender_id === user.id ? '' : message.sender_name} 
          </span>
          <p className="custom-message-text">{message.message}</p>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    <div className="custom-message-input-container">
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
        disabled={loading}
      >
        {loading ? <ClipLoader color="#ffffff" size={20} /> : <i className="custom-send-icon">➤</i>}
      </button>
    </div>
  </div>
</div>


  );
};

export default Chatbot;
