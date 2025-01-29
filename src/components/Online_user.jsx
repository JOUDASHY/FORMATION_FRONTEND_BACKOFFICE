import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';

const OnlineUserList = ({ currentuser }) => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const navigate = useNavigate(); // useNavigate hook for navigation
    const userId = currentuser?.id;

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

    const handleUserClick = (onlineUserId) => {
        navigate(`/chat/${onlineUserId}`); // Navigate to the chat route with the online user's ID
    };

    return (
        <div className="online-user-list">
            <h3>Les utilisateurs en ligne</h3>
            <ul>
                {onlineUsers.map((onlineUser) => (
                    <li 
                        key={onlineUser.id} 
                        className="user-item" 
                        onClick={() => handleUserClick(onlineUser.id)} // Click handler for each user
                        style={{ cursor: 'pointer' }} // Pointer cursor for click indication
                    >
                        <div className="user-img">
                            <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${onlineUser.image}`} alt={`${onlineUser.name}'s avatar`} />
                            <span className="online-indicator"></span>
                        </div>
                        <span className="user-name">{onlineUser.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OnlineUserList;
