import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';

Modal.setAppElement('#root');

function Recherche_user({ user }) {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const navigate = useNavigate();
    const handleMessagesClick = (userId) => {
        navigate(`/chat/${userId}`);
    };
    
    const handleCallClick = (userId) => {
        
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

    const handleClear = () => {
        setSearchQuery('');
        setFilteredUsers([]);
    };

    return (
        <React.Fragment>
            <ToastContainer />
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
                    filteredUsers.map(user => (
                        <div key={user.id} className="card shadow-lg mx-2 my-2 card-profile-bottom">
                            <div className="card-body p-2">
                                <div className="row gx-2">
                                    <div className="col-auto">
                                        <div className="avatar avatar-xl position-relative">
                                            <img
                                                src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${user.image}`}
                                                alt={user.name}
                                                className="w-100 border-radius-lg shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-auto my-auto">
                                        <div className="h-100">
                                            <h5 className="mb-1">{user.name}</h5>({user.type})
                                            {/* <p className="mb-0 font-weight-bold text-sm">{user.type}</p> */}
                                            <p className="mb-0 text-sm">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 my-sm-auto ms-sm-auto me-sm-0 mx-auto mt-1">
                                        <div className="nav-wrapper position-relative end-0">
                                            <ul className="nav nav-pills nav-fill p-1" role="tablist">
                                                <li className="nav-item">
                                                    <a 
                                                        className="nav-link mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                                        onClick={() => handleCallClick(user.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <i className="ni ni-mobile-button"></i>
                                                        <span className="ms-2">Appel</span>
                                                    </a>
                                                </li>
                                                <li className="nav-item">
                                                    <a 
                                                        className="nav-link mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                                        onClick={() => handleMessagesClick(user.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <i className="ni ni-email-83"></i>
                                                        <span className="ms-2">Messages</span>
                                                    </a>
                                                </li>
                                                {/* <li className="nav-item">
                                                    <a className="nav-link mb-0 px-0 py-1 d-flex align-items-center justify-content-center">
                                                        <i className="ni ni-settings-gear-65"></i>
                                                        <span className="ms-2">Settings</span>
                                                    </a>
                                                </li> */}
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
        </React.Fragment>
    );
}

export default Recherche_user;
