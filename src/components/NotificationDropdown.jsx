import React, { useState, useEffect } from 'react';
import { useStateContext } from '../contexts/contextprovider';
import axiosClient from '../axiosClient';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [allNotifications, setAllNotifications] = useState([]);
    const { user } = useStateContext();
    const [showAll, setShowAll] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.id) return;

        const fetchNotifications = async () => {
            try {
                const response = await axiosClient.get(`/notifications/unread`);
                console.log(response.data);
                setAllNotifications(response.data); // Enregistrer toutes les notifications non lues
                setNotifications(response.data.slice(0, 5)); // Limiter l'affichage à 5
            } catch (error) {
                console.error('Erreur lors de la récupération des notifications :', error);
            }
        };

        fetchNotifications();

        let socket;
        let reconnectTimer;

        const connectWebSocket = () => {
            socket = new WebSocket(`ws://${import.meta.env.VITE_SOCKET_NOTIF_URL.replace(/^https?:\/\//, '')}`, user.id);

            socket.onopen = () => {
                console.log('WebSocket connection established');
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.message) {
                    setNotifications((prev) => [
                        ...prev,
                        {
                            id: Date.now(),
                            message: data.message,
                            timestamp: new Date().toISOString(),
                            avatar: 'default-avatar.png',
                        }
                    ]);
                }
            };

            socket.onclose = () => {
                console.log('WebSocket connection closed, attempting to reconnect...');
                reconnectTimer = setTimeout(connectWebSocket, 5000);
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                socket.close();
            };
        };

        connectWebSocket();

        return () => {
            if (socket) socket.close();
            clearTimeout(reconnectTimer);
        };
    }, [user]);

    const markAsRead = async (notificationId) => {
        try {
            await axiosClient.post(`/notifications/${notificationId}/read`);
            setNotifications((prev) => prev.filter(notification => notification.id !== notificationId));
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la notification ${notificationId} :`, error);
        }
    };

    // Compteur des notifications non lues basé sur la liste complète
    const unreadCount = allNotifications.length;

    const handleShowAll = () => {
        if (!showAll) {
            navigate('/Notification_list'); // Rediriger vers la page de notifications
        }
        setShowAll(!showAll);
        setNotifications(showAll ? allNotifications.slice(0, 5) : allNotifications);
    };

    return (
        <li className="nav-item dropdown pe-2 d-flex align-items-center">
            <a
                href="#"
                className="nav-link text-white p-0"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i className="fa fa-bell cursor-pointer"></i>
                {unreadCount > 0 && (
                    <span className="badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle">
                        {unreadCount}
                    </span>
                )}
            </a>
            <ul className="dropdown-menu dropdown-menu-end px-2 py-3 me-sm-n4" aria-labelledby="dropdownMenuButton" style={{ width: '100%', minWidth: '450px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                    <li className="dropdown-item">Aucune notification</li>
                ) : (
                    notifications.map((notification) => (
                        <li key={notification.id} className="mb-2">
                            <a
                                className="dropdown-item border-radius-md"
                                href="#"
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="d-flex py-1">
                                    <div className="my-auto">
                                        <img src={notification.avatar || 'default-avatar.png'} className="avatar avatar-sm me-3" alt="avatar" />
                                    </div>
                                    <div className="d-flex flex-column justify-content-center">
                                        <h6 className="text-sm font-weight-normal mb-1">
                                            <span className="font-weight-bold">{notification.message}</span>
                                        </h6>
                                        <p className="text-xs text-secondary mb-0">
                                            <i className="fa fa-clock me-1"></i>
                                            {
                                                (notification.timestamp || notification.created_at) ? (
                                                    `Il y a ${formatDistanceToNow(parseISO(notification.timestamp || notification.created_at), { locale: fr })}`
                                                ) : (
                                                    'Date inconnue'
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))
                )}
                <li>
                    <button className="dropdown-item text-center d-flex align-items-center justify-content-center" onClick={handleShowAll}>
                        <i className={`fa ${showAll ? 'fa-chevron-up' : 'fa-chevron-down'} me-2`}></i>
                        <span>{showAll ? 'Voir moins' : 'Voir toutes les notifications'}</span>
                    </button>
                </li>
            </ul>
        </li>
    );
};

export default NotificationDropdown;
