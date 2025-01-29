import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Import de la feuille de style toastify
import Modal from 'react-modal'; // Importer React Modal
import axios from "axios";
import { ClipLoader } from 'react-spinners'; // Import du spinner
import axiosClient from "../../axiosClient";

// Fonction pour générer une couleur aléatoire
const getRandomColor = (seed) => {
    const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
        "#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", "#33FFA8",
        "#FFA833", "#57FF33", "#5733FF", "#FF5733", "#33FF57", "#33A8FF"
    ];
    return colors[hash % colors.length];
};

// Configurer le modal
Modal.setAppElement('#root');

function AllEmails() {
  const [loading, setLoading] = useState(false); // État pour le spinner

    const [emails, setEmails] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [selectedEmail, setSelectedEmail] = useState(null);

    // Fetch all emails from the API
    useEffect(() => {
        const fetchEmails = async () => {
            try {
                const response = await axiosClient.get('/contacts');
                const data = response.data;

                if (data.results && Array.isArray(data.results)) {
                    // Pour chaque email, récupérer les réponses associées
                    const emailsWithResponses = await Promise.all(
                        data.results.map(async (email) => {
                            const response = await axiosClient.get(`/contacts/${email.id}/responses`);
                            return {
                                ...email,
                                response: response.data.length > 0 ? response.data[0].response : null,  // Affichez la première réponse si disponible
                            };
                        })
                    );
                    setEmails(emailsWithResponses);
                } else {
                    console.error("Expected an array in 'results' but received:", data);
                }
            } catch (error) {
                console.error("Error fetching emails:", error);
            }
        };

        fetchEmails();
    }, []);

    const handleSelectEmail = (emailId) => {
        setSelectedEmails((prevSelected) => {
            if (prevSelected.includes(emailId)) {
                return prevSelected.filter((id) => id !== emailId);
            } else {
                return [...prevSelected, emailId];
            }
        });
    };

    const handleDeleteSelected = async () => {
        const deletePromises = selectedEmails.map(async (emailId) => {
            try {
                const response = await axiosClient.delete(`/contacts/${emailId}`);
    
                if (response.status === 200) {
                    return emailId;
                } else {
                    console.error(`Erreur lors de la suppression de l'email avec l'ID: ${emailId}`);
                    return null;
                }
            } catch (error) {
                console.error(`Erreur lors de la suppression de l'email avec l'ID: ${emailId}`, error);
                return null;
            }
        });
        const deletedEmails = await Promise.all(deletePromises);
        setEmails((prevEmails) =>
            prevEmails.filter((email) => !deletedEmails.includes(email.id))
        );

        setSelectedEmails([]);
        toast.success('Emails supprimés avec succès !');
    };

    const openModal = (email) => {
        setSelectedEmail(email);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setResponseMessage("");
    };

    const handleSendResponse = async (event, email) => {
        event.preventDefault();
        setLoading(true); // Afficher le spinner
    
        try {
            await axiosClient.post(`/contacts/${email.id}/responses`, {
                response: responseMessage, // Message de la réponse
                email: email.email,       // Adresse email du contact
            });
            setModalIsOpen(false);
            toast.success("Message envoyé avec succès");
    
            // Ajouter la réponse au tableau des emails pour affichage immédiat
            setEmails((prevEmails) =>
                prevEmails.map((e) =>
                    e.id === email.id ? { ...e, response: responseMessage } : e
                )
            );
        } catch (err) {
            toast.error("Échec de l'envoi du message");
            console.error(err);
        } finally {
            setLoading(false); // Masquer le spinner
        }
    };
    

    return (
        <div className="all-emails">
            <ToastContainer />

            <h2 className="text-dark">
    <i className="fas fa-envelope mr-2"></i> Tous les Emails
</h2>


            {selectedEmails.length > 0 && (
                <button className="delete-btn" onClick={handleDeleteSelected}>
                    <i className="fas fa-trash"></i> Supprimer sélectionnés
                </button>
            )}

            <div className="emails-list">
                {emails.map((email) => {
                    const profileColor = getRandomColor(email.name);
                    const initial = email.name.charAt(0).toUpperCase();

                    return (
                        <div className="email-item" key={email.id}>
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={selectedEmails.includes(email.id)}
                                onChange={() => handleSelectEmail(email.id)}
                            />
                            <div
                                className="profile-photo-email"
                                style={{ backgroundColor: profileColor }}
                            >
                                {initial}
                            </div>
                            <div className="message">
                                <b>{email.name}</b>
                                <p>{email.email}</p>
                                <p>{email.message}</p>
                                <small>Reçu le : {email.created_at}</small>
                                {email.response && (
                                    <div style={{ marginTop: '10px', color: '#3498db' }}>
                                        <strong>Réponse :</strong> {email.response}
                                    </div>
                                )}
                            </div>
                            <button className="reply-btn" onClick={() => openModal(email)}>
                                <i className="fas fa-reply"></i> Répondre
                            </button>
                        </div>
                    );
                })}
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                overlayClassName="modal-overlay"
                className="customModal"
            >
                <div className="modal-content">
                    <h2>Répondre à {selectedEmail?.email}</h2>
                    <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Écrivez votre réponse ici..."
                    />
                    <button onClick={(event) => handleSendResponse(event, selectedEmail)}  disabled={loading}>
                    {loading ? (
                          <ClipLoader color="#ffffff" size={20} /> // Spinner ici
                        ) : (
                          <> <i className="fas fa-paper-plane"></i> Envoyer</>
                    )}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default AllEmails;
