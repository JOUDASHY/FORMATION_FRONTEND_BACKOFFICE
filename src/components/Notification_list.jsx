import React, { useState, useEffect } from 'react';
import { useStateContext } from '../contexts/contextprovider';
import axiosClient from '../axiosClient';
import { formatDistanceToNow, parseISO } from 'date-fns'; // Import des fonctions de date-fns
import { fr } from 'date-fns/locale'; // Import de la locale française

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useStateContext();

    useEffect(() => {
        if (!user?.id) return; // Si l'utilisateur n'est pas connecté, on ne fait rien

        const fetchAllNotifications = async () => {
            try {
                // Nous récupérons toutes les notifications (en s'assurant que l'endpoint est correct)
                const response = await axiosClient.get(`/notifications/unread`);
                console.log(response.data);
                
                // On met à jour l'état des notifications
                if (response.data && Array.isArray(response.data)) {
                    setNotifications(response.data);
                } else {
                    console.error('Données incorrectes retournées depuis l\'API');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des notifications :', error);
            }
        };

        fetchAllNotifications();
    }, [user]);

    // Fonction pour marquer une notification comme lue
    const markAsRead = async (notificationId) => {
        try {
            await axiosClient.post(`/notifications/${notificationId}/read`); // Assurez-vous que cette route existe
            // On filtre la notification marquée comme lue pour la supprimer de l'affichage
            setNotifications((prev) => prev.filter(notification => notification.id !== notificationId));
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la notification ${notificationId} :`, error);
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
            <h3 className="text-white">Liste des Notifications</h3>

            </div>
            <div className="flex-grow-1 overflow-auto">
                {notifications.length === 0 ? (
                    <div className="text-center py-5">Aucune notification disponible.</div> // Si aucune notification n'est récupérée
                ) : (
                    <ul className="list-group">
                        {notifications.map((notification) => (
                            <li key={notification.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    {/* Avatar par défaut si l'avatar est manquant */}
                                    <img src={notification.avatar || 'default-avatar.png'} className="avatar avatar-sm me-3" alt="avatar" />
                                    <div>
                                        <h6 className="text-sm font-weight-normal mb-1">
                                            <span className="font-weight-bold">{notification.message}</span>
                                        </h6>
                                        <p className="text-xs text-secondary mb-0">
                                            <i className="fa fa-clock me-1"></i> 
                                            {/* Affichage de la date formatée avec "Il y a" */}
                                            {`Il y a ${formatDistanceToNow(parseISO(notification.created_at), { locale: fr })}`}
                                        </p>
                                    </div>
                                </div>
                                {/* Bouton pour marquer la notification comme lue */}
                                <button 
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    Marquer comme lue
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
