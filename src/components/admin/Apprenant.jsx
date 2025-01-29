import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../axiosClient';
import user from "../../assets/img/user.png"
import { ClipLoader } from 'react-spinners'; // Import du spinner
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

function Apprenant() {
  const [loading, setLoading] = useState(false); // État pour le spinner
  const navigate = useNavigate();

    const options = [
        { value: 'masculin', label: 'masculin' },
        { value: 'feminin', label: 'feminin' }
    ];
    
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
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sex, setSex]= useState('');
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
            if (fileimage) {
                formData.append('image', fileimage);
            }
            formData.append('type', "apprenant");
         formData.append('contact', contact);
            formData.append('password', password);
            formData.append('sex', sex);

            await axiosClient.post("/users", formData, {
                headers: { 'Content-Type': "multipart/form-data" },
            });
            toast.success('Apprenant enregistré avec succès !');
            resetForm();
        } catch (err) {
            toast.error("Échec de l'enregistrement de l'apprenant");
        }finally {
            setLoading(false); // Masquer le spinner
          }
    }


  

    useEffect(() => {
        (async () => await Load())();
    }, []);

    async function Load() {
        try {
            const result = await axiosClient.get("/users");
            if (Array.isArray(result.data)) {
                const formateurs = result.data.filter(user => user.type === 'apprenant');
                setUsers(formateurs);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des apprenants:", error);
            setUsers([]);
        }
    }
  
    const openAddModal = () => {
        resetForm(); // Réinitialiser le formulaire avant d'ouvrir le modal d'ajout
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        editUser(user);
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        editUser(user);
    };

    async function editUser(user) {
        setName(user.name);
        setEmail(user.email);
        // setType(user.type);
        setContact(user.contact);
        setId(user.id);
        setSex(user.sex);
        setPhoto(user.image);
    }

    async function update(event) {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
             formData.append('contact', contact);
    

            formData.append('sex', sex);

            formData.append('type', type || '');
            if (fileimage instanceof File) {
                formData.append('image', fileimage);
            }

            await axiosClient.post(`/updateuser/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Utilisateur mis à jour avec succès');
            resetForm();
        } catch (err) {
            if (err.response && err.response.data) {
                console.log("Données d'erreur :", err.response.data);
                toast.error('Échec de la mise à jour de l\'apprenant : ' + err.response.data.message);
            } else {
                toast.error('Erreur inconnue lors de la mise à jour de l\'apprenant');
            }
        }
    }

    async function DeleteUser(id) {
        try {
            await axiosClient.delete("/users/" + id);
            toast.success('Apprenant supprimé avec succès');
            resetForm();
        } catch (err) {
            toast.error('Échec de la suppression de l\'apprenant');
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
        setIsModalOpen(false);
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

    return (
        <React.Fragment>
            <ToastContainer />

            {/* Modal pour ajouter un utilisateur */}
            <Modal
    overlayClassName="modal-overlay"
    className="user-card-modal"
    isOpen={isModalOpen && !selectedUser}
    onRequestClose={() => setIsModalOpen(false)}
>
    <div className="user-card-container">
        <div className="user-card-header">
            <div className="user-avatar">
                {fileimage ? (
                    <img 
                        src={fileimage instanceof File ? URL.createObjectURL(fileimage) : `${import.meta.env.VITE_API_BASE_URL}/uploads/${fileimage}`} 
                        alt="User Profile" 
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
            <h2 className="user-card-title">
                {selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h2>
        </div>

        <form onSubmit={save} className="user-card-form">
            <div className="user-card-input-group">
                <label htmlFor="username" className="user-label">Nom</label>
                <input 
                    type="text" 
                    id="username" 
                    className="user-input" 
                    placeholder="Nom de l'utilisateur" 
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
                       
                        <button type="submit"  disabled={loading}  className={`user-card-button ${selectedUser ? 'user-card-button-edit' : 'user-card-button-add'}` }>
                {loading ? (
                          <ClipLoader color="#ffffff" size={20} /> // Spinner ici
                        ) : (<> {selectedUser ? 'Modifier' : 'Ajouter'} </> )}
                </button>
                <button type="button" className="user-card-button user-card-button-cancel" onClick={() => setIsModalOpen(false)}>
                    Annuler
                </button>
            </div>
        </form>
    </div>
</Modal>
























            {/* Modal pour modifier un utilisateur */}
            <Modal
    overlayClassName="modal-overlay"
    className="user-card-modal"
    isOpen={isModalOpen && selectedUser}
    onRequestClose={() => setIsModalOpen(false)}
>
    <div className="user-card-container">
        <div className="user-card-header">
            <div className="user-avatar">
                {fileimage ? (
                    <img 
                        src={fileimage instanceof File ? URL.createObjectURL(fileimage) : `${import.meta.env.VITE_API_BASE_URL}/uploads/${fileimage}`} 
                        alt="User Profile" 
                        className="user-image" 
                    />
                ) : (
                    <div className="user-image-placeholder">+</div>
                )}
            </div>
            <h2 className="user-card-title">
                {selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h2>
        </div>

        <form onSubmit={update} className="user-card-form">
            <div className="user-card-input-group">
                <label htmlFor="username" className="user-label">Nom</label>
                <input 
                    type="text" 
                    id="username" 
                    className="user-input" 
                    placeholder="Nom de l'utilisateur" 
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
                <button type="submit" className={`user-card-button ${selectedUser ? 'user-card-button-edit' : 'user-card-button-add'}`}>
                    {selectedUser ? 'Modifier' : 'Ajouter'}
                </button>
                <button type="button" className="user-card-button user-card-button-cancel" onClick={() => setIsModalOpen(false)}>
                    Annuler
                </button>
            </div>
        </form>
    </div>
</Modal>


            {/* Modal de suppression */}
            <Modal 
                overlayClassName="modal-overlay" 
                className="customModal" 
                isOpen={isDeleteModalOpen} 
                onRequestClose={() => setIsDeleteModalOpen(false)}
            >
                <div className="modal-body text-center">
                    <p>Voulez-vous supprimer l'utilisateur {selectedUser?.name} ?</p>
                    <div className="modal-footer justify-content-center">
                        <button className='btn btn-danger' onClick={() => DeleteUser(selectedUser?.id)}>
                            <i className="fas fa-trash"></i> Supprimer
                        </button>
                        <button className='btn btn-secondary' onClick={() => resetForm()}>
                            <i className="fas fa-times"></i> Annuler
                        </button>
                    </div>
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
  <h2 className="me-0 header-title">Liste des apprenants</h2>

  <button onClick={openAddModal} className="btn-create"> 
    <i className="fas fa-plus"></i> <span className="btn-label">Ajouter un apprenant</span>
  </button>

  {/* Barre de recherche */}
  <div className="ms-2 pe-md-3 d-flex align-items-center search-container">
    <div className="input-group" style={{ flex: 1, maxWidth: '400px' }}> 
      <span className="input-group-text text-body">
        <i className="fas fa-search" aria-hidden="true"></i>
      </span>
      <input
        type="text"
        className="form-control search-input"
        placeholder="Rechercher un apprenant..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)} 
      />
    </div>
  </div>
</div>

                <div className="cards-container">
  {filteredUsers.map((user) => (
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
      <div className="profile-actions d-flex justify-content-start gap-0">
  <button className="btn btn-primary" onClick={() => openEditModal(user)}>
    <i className="fas fa-edit"></i> 
  </button>
  <button className="btn btn-danger" onClick={() => openDeleteModal(user)}>
    <i className="fas fa-trash "></i> 
  </button>
</div>

    </div>
  ))}
</div>

            </div>
        </React.Fragment>
    );
}

export default Apprenant;
