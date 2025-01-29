import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import Modal from 'react-modal';
import Select from 'react-select';
import axiosClient from '../../axiosClient';
import user from "../../assets/img/user.png"
import { ClipLoader } from 'react-spinners'; // Import du spinner


Modal.setAppElement('#root');

function Formateur() {

    const navigate = useNavigate();

    const options = [
        { value: 'masculin', label: 'masculin' },
        { value: 'feminin', label: 'feminin' }
    ];
    const [loading, setLoading] = useState(false); // État pour le spinner

    const [fileimage, setPhoto] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [id, setId] = useState('');
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [type, setType] = useState(null);
    const [contact, setContact] = useState("");
    const [password, setPassword] = useState("");
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [sex, setSex]= useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Modal pour ajouter
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal pour éditer
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal pour supprimer
    const handleChange_sex = (selectedOption) => {
        setSex(selectedOption ? selectedOption.value : '');
    };
    const handleChange = (selectedOption) => {
        setType(selectedOption ? selectedOption.value : '');
    };
    async function save(event) {
        event.preventDefault();
        setLoading(true); // Afficher le spinner
    
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            if (fileimage) formData.append('image', fileimage);
            formData.append('type', "formateur");
             formData.append('contact', contact);
    
            if (password) formData.append('password', password);
            formData.append('sex', sex);
    
            // Debug: Inspecter les champs FormData
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
    
            // Envoyer les données au backend
            await axiosClient.post("/users", formData, {
                headers: { 'Content-Type': "multipart/form-data" },
            });
    
            toast.success("Formateur enregistré avec succès");
            resetForm();
        } catch (err) {
            if (err.response && err.response.data) {
                console.error("Erreur serveur :", err.response.data);
                toast.error(`Erreur : ${err.response.data.message || "Un problème est survenu."}`);
            } else {
                console.error("Erreur réseau :", err);
                toast.error("Échec de la communication avec le serveur.");
            }
        } finally {
            setLoading(false); // Masquer le spinner
        }
    }
    

    async function Load() {
        try {
            const result = await axiosClient.get("/users");
            if (Array.isArray(result.data)) {
                const formateurs = result.data.filter(user => user.type === 'formateur');
                setUsers(formateurs);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs:", error);
            setUsers([]);
        }
    }

    useEffect(() => {
        Load();
    }, []);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setName(user.name);
        setEmail(user.email);
        setType(user.type);
        setContact(user.contact);
        setId(user.id);
        setSex(user.sex);
        setPhoto(user.image);
        setIsEditModalOpen(true);
    };

    async function update(event) {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
              formData.append('email', email);
         formData.append('contact', contact);
            formData.append('type', type || '');
            formData.append('sex', sex);

            if (fileimage instanceof File) {
                formData.append('image', fileimage);
            }

            await axiosClient.post(`/updateuser/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Utilisateur mis à jour avec succès');
            resetForm();
        } catch (err) {
            toast.error('Erreur lors de la mise à jour de l\'utilisateur');
        }
    }

    async function DeleteUser(id) {
        try {
            await axiosClient.delete("/users/" + id);
            resetForm();
            toast.success('Formateur supprimé avec succès');
        } catch (err) {
            toast.error('Échec de la suppression du formateur');
        }
    }

    const resetForm = () => {
        setId("");
        setName('');
        setEmail('');
        setType(null);
        setContact('');
        setPhoto(null);
        setPassword('');
        setSex('');
        setSelectedUser(null);
        Load();
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.description && user.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const openAddModal = () => {
        resetForm(); // Réinitialiser tous les champs
        setIsAddModalOpen(true);
    };

    return (
        <React.Fragment>
            <ToastContainer />

            {/* Modal pour ajouter un formateur */}
            <Modal
    overlayClassName="modal-overlay"
    className="user-card-modal"
    isOpen={isAddModalOpen}
    onRequestClose={() => setIsAddModalOpen(false)}
>
    <div className="user-card-container">
        <div className="user-card-header">
            <div className="user-avatar">
                {fileimage ? (
                    <img 
                        src={fileimage instanceof File ? URL.createObjectURL(fileimage) : `${import.meta.env.VITE_API_BASE_URL}/uploads/${fileimage}`} 
                        alt="Profile Formateur" 
                        className="user-image" 
                    />
                ) : (
                    <img 
                        src={user}
                        alt="Default Profile" 
                        className="user-image-placeholder" 
                    />
                )}
            </div>
            <h2 className="user-card-title">Ajouter un formateur</h2>
        </div>

        <form onSubmit={save} className="user-card-form">
            <div className="user-card-input-group">
                <label htmlFor="username" className="user-label">Nom</label>
                <input 
                    type="text" 
                    id="username" 
                    className="user-input" 
                    placeholder="Nom du formateur" 
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
                    required 
                />
            </div>
            <div className="user-card-input-group">
                <label htmlFor="email">Sexe</label>
                
            <Select
                value={options.find(stat => stat.value === sex) || null} 
                onChange={handleChange_sex}
                options={options}
                className="customSelect"
                placeholder="Sexe"
                isClearable
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

            <div className="user-card-footer">
                         
                        <button type="submit" disabled={loading} className="user-card-button user-card-button-add" >
                {loading ? (
                          <ClipLoader color="#ffffff" size={20} /> // Spinner ici
                        ) : (
                          <>Ajouter</>
                        )}</button>
                <button type="button" className="user-card-button user-card-button-cancel" onClick={() => setIsAddModalOpen(false)}>
                    Annuler
                </button>
            </div>
        </form>
    </div>
</Modal>

            {/* Modal pour éditer un formateur */}
            <Modal
                overlayClassName="modal-overlay"
                className="user-card-modal"
                isOpen={isEditModalOpen}
                onRequestClose={() => setIsEditModalOpen(false)}
            >
                <div className="user-card-container">
                    <div className="user-card-header">
                        <div className="user-avatar">
                            {fileimage ? (
                                <img 
                                    src={fileimage instanceof File ? URL.createObjectURL(fileimage) : `${import.meta.env.VITE_API_BASE_URL}/uploads/${fileimage}`} 
                                    alt="Profile Formateur" 
                                    className="user-image" 
                                />
                            ) : (
                                <img 
                                    src="default-profile-image-url"
                                    alt="Default Profile" 
                                    className="user-image-placeholder" 
                                />
                            )}
                        </div>
                        <h2 className="user-card-title">Modifier le formateur</h2>
                    </div>

                    <form onSubmit={update} className="user-card-form">
                        <div className="user-card-input-group">
                            <label htmlFor="username" className="user-label">Nom</label>
                            <input 
                                type="text" 
                                id="username" 
                                className="user-input" 
                                placeholder="Nom du formateur" 
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
                                required 
                            />
                        </div>
                        <div className="user-card-input-group">
                <label htmlFor="email">Sexe</label>
                
            <Select
                value={options.find(stat => stat.value === sex) || null} 
                onChange={handleChange_sex}
                options={options}
                className="customSelect"
                placeholder="Sexe"
                isClearable
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

                        <div className="user-card-footer">
                            <button type="submit" className="user-card-button user-card-button-add">Modifier</button>
                            <button type="button" className="user-card-button user-card-button-cancel" onClick={() => setIsEditModalOpen(false)}>
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal pour la suppression */}
            <Modal
                overlayClassName="modal-overlay"
                className="customModal"
                isOpen={isDeleteModalOpen}
                onRequestClose={() => setIsDeleteModalOpen(false)}
            >
                <div className="modal-body text-center">
                    <p>Voulez-vous supprimer le formateur {selectedUser?.name} ?</p>
                    <button onClick={() => DeleteUser(selectedUser?.id)} className="btn supprimer-button">Supprimer</button>
                    <button onClick={() => resetForm()} className="btn annuler-button">Annuler</button>
                </div>
            </Modal>

<div className="recent-orders">
<div className="header-bar">  
<button
        className="btn btn-secondary"
        onClick={() => navigate(-1)} // Retour à la page précédente
      >
        <i className="fas fa-arrow-left me-2"></i> {/* Icône de retour */}
        Retour
      </button>
    <h2 className="me-0">Liste des formateurs</h2>

    {/* Bouton pour ajouter un formateur */}
    <button onClick={openAddModal} className='btn-create'> 
        <i className="fas fa-plus"></i> 
        <span className="d-none d-md-inline"> Nouvel formateur</span> {/* Masque le label sur les écrans mobiles */}
    </button>

    {/* Barre de recherche */}
    <div className="ms-2 pe-md-3 d-flex align-items-center">
        <div className="input-group" style={{ flex: 1, maxWidth: '400px' }}> 
            <span className="input-group-text text-body">
                <i className="fas fa-search" aria-hidden="true"></i>
            </span>
            <input
                type="text"
                className="form-control"
                placeholder="Rechercher un formateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
            />
        </div>
    </div>
</div>


    {/* Liste des formateurs */}
    <div className="cards-container">
        {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
                <div className="profile-card" key={user.id}>
                       <div className="profile-info">
        <img 
          src={user.image ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${user.image}` : userPlaceholder} 
          alt={user.name} 
          className="profile-image" 
        />
     <div className="profile-details">
  <h2 className="profile-name text-primary">
    Nom : {user.name}
  </h2>
  <p className="profile-title text-dark">
    <i className="fas fa-envelope me-2 text-success"></i> Email : {user.email}
  </p>
  <p className="profile-title text-dark">
    <i className="fas fa-phone-alt me-2 text-warning"></i> Contact :  🇲🇬 +261 {user.contact}
  </p>
</div>

      </div>
                    <div className="profile-actions">
                        <button className="btn btn-primary" onClick={() => handleEditClick(user)}>
                            <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-danger" onClick={() => openDeleteModal(user)}>
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            ))
        ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>Aucun formateur trouvé</div>
        )}
    </div>
    
  
</div>
        </React.Fragment>
    );
}

export default Formateur;
