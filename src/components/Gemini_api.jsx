import React, { useState, useRef } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners"; // Assurez-vous d'avoir installé cette dépendance pour l'animation de chargement

const GeminiAIChat = ({user}) => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    { text: `Bonjour ${user.name}, comment puis-je vous aider aujourd'hui ?`, sender: "AI" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Remplacez par votre clé API
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
    API_KEY;

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    const newMessage = { text: inputText, sender: "User" };
    setMessages([...messages, newMessage]);
    setLoading(true);
    setError("");

    const requestData = {
      contents: [
        {
          parts: [
            {
              text: `${inputText} 
              
              Formate la réponse en texte brut sans utiliser de caractères spéciaux comme **, *, -, ou autres symboles Markdown. Évite les listes à puces et utilise des phrases complètes pour chaque étape."`,
            },
          ],
        },
      ],
    };
    

    try {
      const response = await axios.post(API_URL, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response.data;
      if (result.candidates && result.candidates.length > 0) {
        const generatedResponse =
          result.candidates[0].content.parts[0].text || "Désolé, je n'ai pas compris.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: generatedResponse, sender: "AI" },
        ]);
      } else {
        setError("Aucune réponse générée.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response ? err.response.data : "Erreur lors de la génération du contenu.");
    } finally {
      setLoading(false);
    }

    setInputText("");
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
              src="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg"
              alt="Chatbot"
              className="custom-chatbot-image"
            />
            <div className="custom-receiver-info">
              <div className="chat-name">  
              Assistant IA ChatBOT              
            </div>
            <span className="custom-receiver-type">Assistance virtuelle instantanée</span>

            </div>
            <div className="custom-chat-status">
              <span className="custom-status-indicator online"></span>
              <span className="custom-status-text">En ligne</span>
            </div>
          </>
        </div>

        <div className="custom-messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`custom-message-bubble ${
                message.sender === "AI" ? "custom-received" : "custom-sent"
              }`}
            >
              {message.sender === "AI" && (
                <img
                  src={`https://media.istockphoto.com/id/1445426863/fr/vectoriel/concept-de-conception-de-logo-vectoriel-chat-bot.jpg?s=612x612&w=0&k=20&c=HMIHtjqCnZ0ajOCUrJnHlaAh8Fj1_ubPieZ1P9unoWo=`}
                  alt="AI Avatar"
                  className="custom-receiver-avatar"
                />
              )}
              <span className="custom-message-sender">
                {message.sender === "AI" ? "" : "vous"}
              </span>
              <p className="custom-message-text">{message.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="custom-message-input-container">
          <input
            type="text"
            className="custom-message-input"
            placeholder="Tapez votre message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            className="custom-send-button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <ClipLoader color="#ffffff" size={20} /> : <i className="custom-send-icon">➤</i>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiAIChat;
