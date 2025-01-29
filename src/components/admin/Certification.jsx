import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';


import CertificationModal from './CertificationModal';
import axiosClient from '../../axiosClient';

Modal.setAppElement('#root');

function Certification() {
  const navigate = useNavigate();

    const [selectedCertification, setSelectedCertification] = useState(null);
    const [id, setId] = useState('');
    const [user_id, setUser_id] = useState("");
    const [formation_id, setFormation_id] = useState("");
  
    const [obtention_date, setObtention_date] = useState("");
 
    const [certifications, setCertifications] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // Nouvel état pour la barre de recherche

    const [options, setOptions] = useState([]);

    const [usersOptions, setUsersOptions] = useState([]);
    const [selectedFormation, setSelectedFormation] = useState(null); // Formation sélectionnée

    const [formationsMap, setFormationsMap] = useState({});
    const [usersMap, setUsersMap] = useState({});

    useEffect(() => {
        (async () => await Load())();
    }, []);

    async function Load() {
        const result = await axiosClient.get("/certifications");
        setCertifications(result.data.results);
        
    }



    const handleClose = () => {
        setNotification(null);
    };

    const handleEditClick = (certification) => {
        setSelectedCertification(certification);
        setIsModalOpen(true); 
        editCertification(certification);
    };


  // Gérer la sélection d'une formation
  const handleChange = (selectedOption) => {
    setSelectedFormation(selectedOption);


    setFormation_id(selectedOption.value); // Stocker l'ID de la formation sélectionnée
    console.log('formation sélectionnée:', selectedOption);
  };



  const handleUserChange = (selectedOption) => {


    setUser_id(selectedOption.value);  // Stocker l'ID de l'utilisateur sélectionné
    console.log('Utilisateur sélectionné:', selectedOption);
  };



  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axiosClient.get('/users');
        const formattedUserOptions = response.data
          .filter(user => user.type === 'apprenant')  // Filtrer les utilisateurs de type 'apprenant'
          .map((user) => ({
            value: user.id,  // Utiliser l'id pour la valeur
            label: user.name // Utiliser le name pour l'étiquette
          }));
          
        setUsersOptions(formattedUserOptions);  // Mettre à jour l'état avec les utilisateurs filtrés
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    }
  
    fetchUsers();
  }, []);
  
  



  useEffect(() => {
    async function fetchformations() {
      try {
        const response = await axiosClient.get('/formations');
        const formations = response.data.results;
  
        // Créer une map de formation_id vers formation name
        const formationsMap = {};
        formations.forEach((formation) => {
          formationsMap[formation.id] = formation.name;
        });
  
        setFormationsMap(formationsMap);
      } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error);
      }
    }
  
    fetchformations();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axiosClient.get('/users');
        const users = response.data;
        // Créer une map de user_id vers user name
        const usersMap = {};
        users.forEach((user) => {
          usersMap[user.id] = user.name;
        });
  
        setUsersMap(usersMap);
      } catch (error) {
        console.error('Erreur lors de la récupération des users:', error);
      }
    }
  
    fetchUsers();
  }, []);



  // Charger les formations depuis l'API
  useEffect(() => {
    async function fetchformations() {
      try {
        const response = await axiosClient.get('/formations');
        const formattedOptions = response.data.results.map((formation) => ({
          value: formation.id,  // Utiliser l'id pour la valeur
          label: formation.name // Utiliser le name pour l'étiquette
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error);
      }
    }
    fetchformations();
  }, []);

    async function editCertification(certification) {
        setUser_id(certification.user_id);
        setFormation_id(certification.formation_id);
        setObtention_date(certification.obtention_date);
        setId(certification.id);

        
    }


    async function save(event) {
      event.preventDefault();
      try {
        // Créer FormData pour envoyer les données
        const formData = new FormData();
        formData.append('user_id', user_id);
        formData.append('formation_id', formation_id);
        formData.append('obtention_date', obtention_date);
    
        // Envoyer la requête POST
        await axiosClient.post("/certifications", formData, {
          headers: { 'Content-Type': "multipart/form-data" },
        });
    
        // Afficher un message de succès
        toast.success("Certification enregistrée avec succès");
        resetForm(); // Réinitialiser le formulaire après un succès
      } catch (err) {
        // Vérifier si la réponse contient un message d'erreur
        if (err.response && err.response.data && err.response.data.message) {
          // Afficher le message d'erreur spécifique du serveur
          toast.error(err.response.data.message);
        resetForm(); // Réinitialiser le formulaire après un succès

        } else {
          // Afficher un message générique en cas d'erreur inattendue
          toast.error("Échec de l'enregistrement de la certification");
        resetForm(); // Réinitialiser le formulaire après un succès

        }
      }
    }
    
    async function update(event) {
      event.preventDefault();
      try {
        const formData = {
          user_id,
          formation_id,
          obtention_date
        };
        
        // Envoyer la requête PUT
        await axiosClient.put(`/certifications/${id}`, formData);
        
        // Réinitialiser le formulaire et afficher un message de succès
        resetForm();
        toast.success('Certification mise à jour avec succès');
      } catch (err) {
        // Récupérer le message d'erreur depuis la réponse du serveur
        if (err.response && err.response.data && err.response.data.message) {
          // Afficher le message d'erreur spécifique

          toast.error(err.response.data.message);
        resetForm(); // Réinitialiser le formulaire après l'ajout réussi

        } else {
          // Afficher un message d'erreur générique si aucun message spécifique n'est disponible
          toast.error("Échec de la mise à jour de la certification");
        }
      }
    }
    

    async function Deletecertification(id) {
        await axiosClient.delete(`/certifications/${id}`);
        resetForm();
        toast.success('certification supprimée avec succès');
    }

    const resetForm = () => {
        setId("");
        setUser_id('');
        setFormation_id('');
        setObtention_date('');

        setSelectedCertification(null);
        Load();
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
    };

    const openDeleteModal = (certification) => {
        setSelectedCertification(certification);
        setIsDeleteModalOpen(true); 
    };

    // Filtrer les certifications en fonction de la recherche
    // const filteredCertifications = certifications.filter(certification =>
    //     certification.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     certification.description.toLowerCase().includes(searchQuery.toLowerCase())
    // );
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
    const [selectedCertificateData, setSelectedCertificateData] = useState(null);
    
    const handleShowClick = (certification) => {
      // Vérifier si les formations sont déjà chargées
      const formation = options.find(formation => formation.value === certification.formation_id);
      
      if (formation) {
          // Récupérer les modules de la formation sélectionnée
          const modules = formation.modules || [];  // Si pas de modules, on prend un tableau vide
          console.log('Modules :', modules);
  
          setSelectedCertificateData({
              userName: usersMap[certification.user_id] || 'N/A',
              formationName: formation.label,
              obtentionDate: certification.obtention_date,
              modules
          });
  
          setIsCertificateModalOpen(true);
      } else {
          console.error("Formation non trouvée pour cette certification.");
      }
  };
  
    // Récupération des formations avec leurs modules
    useEffect(() => {
      async function fetchformations() {
        try {
          const response = await axiosClient.get('/formations');
          const formattedOptions = response.data.results.map((formation) => ({
            value: formation.id,
            label: formation.name,
            modules: formation.modules || []  // Assurez-vous d'inclure les modules dans chaque formation
          }));
          setOptions(formattedOptions);
        } catch (error) {
          console.error('Erreur lors de la récupération des formations:', error);
        }
      }
      fetchformations();
    }, []);
    
    
    

    const filteredCertifications = certifications.filter(certification => {
        const user = usersOptions.find(user => user.value === certification.user_id);
        const formation = options.find(formation => formation.value === certification.formation_id);
    
        const userName = user ? user.label : '';
        const formationName = formation ? formation.label : '';
    
        return (
            userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            formationName.toLowerCase().includes(searchQuery.toLowerCase()) 

        );
    });
    
//     const handleShowClick = (certification) => {
//       setSelectedCertification(certification); // Stocker les détails de la certification sélectionnée
//       setIsModalOpen(true);  // Ouvrir le modal
//   };
  
    const openAddModal = () => {
        resetForm(); // Réinitialiser le formulaire avant d'ouvrir le modal d'ajout
        setIsModalOpen(true);
    };

    const openEditModal = (certification) => {
        setSelectedCertification(certification);
        setUser_id(certification.user_id);
        setFormation_id(certification.formation_id);
        setObtention_date(certification.obtention_date);
        setId(certification.id);
        setIsModalOpen(true);
    };

    return (
        <React.Fragment>
            <ToastContainer />
      

<CertificationModal 
            isOpen={isCertificateModalOpen} 
            onRequestClose={() => setIsCertificateModalOpen(false)} 
            certificateData={selectedCertificateData}
        />



<Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isModalOpen} 
    onRequestClose={() => setIsModalOpen(false)}
>
    <div className="modal-header">
        <h4 className="modal-title">
            {selectedCertification ? "Modifier la certification" : "Ajouter une certification"}
        </h4>
     
    </div>
    <div className="modal-body">
        <form onSubmit={selectedCertification ? update : save}>
            {/* Select Formation */}
            <div className="form-group">
            <label htmlFor="date-field">Formation</label>
                <Select
                    value={options.find(option => option.value === formation_id)} 
                    onChange={handleChange}
                    options={options}
                    placeholder="Choisir une formation"
                    className="customSelect"
                    classNamePrefix="custom-select"
                />
            
            </div>
                       <div className="form-group">
                <label htmlFor="date-field">Apprenant</label>
            {/* Select Apprenant */}
     
                <Select
                    value={usersOptions.find(option => option.value === user_id)} 
                    onChange={handleUserChange} 
                    options={usersOptions}  
                    placeholder="Choisir un apprenant"
                    className="customSelect"
                    classNamePrefix="custom-select"
                    menuPortalTarget={document.body} // Ajouter cette propriété pour le portail
                    styles={{
                      menuPortal: base => ({
                        ...base,
                        zIndex: 10500 // Assurez-vous que le menu est au-dessus du modal
                      })
                    }}
                />
          
            </div>

                       <div className="form-group">
                <label htmlFor="date-field">Date d'obtention</label>
            {/* Date */}
                <input 
                    type="date" 
                    id="date-field" 
                    name="date" 
                    value={obtention_date} 
                    onChange={(e) => setObtention_date(e.target.value)} 
                    required 
                    className="form-control" // Ajouter une classe pour le style
                />
            </div>
     


            {/* Footer modal */}
            <div className="modal-footer">
                <button 
                    type="submit" 
                    className={`btn ${selectedCertification ? 'btn-warning' : 'btn-primary'}`}>
                    {selectedCertification ? (
                        <>
                            <i className="fas fa-edit"></i> Modifier
                        </>
                    ) : (
                        <>
                            <i className="fas fa-plus"></i> Ajouter
                        </>
                    )}
                </button>
                <button className='btn btn-secondary' type="button" onClick={() => resetForm()}>
                    <i className="fas fa-times"></i> Annuler
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
        <p>Voulez-vous supprimer la certification {selectedCertification?.name} ?</p>
        <div className="modal-footer justify-content-center">
            <button className='btn btn-danger' onClick={() => Deletecertification(selectedCertification?.id)}>
                <i className="fas fa-trash"></i> Supprimer
            </button>
            <button className='btn btn-secondary' onClick={() => resetForm()}>
                <i className="fas fa-times"></i> Annuler
            </button>
        </div>
    </div>
</Modal>



<div className="row">
  <div className="col-12">
    <div className="card mb-4">
    <div className="card-header pb-0 d-flex align-items-center">
      <button
        className="btn btn-secondary"
        onClick={() => navigate(-1)} // Retour à la page précédente
      >
        <i className="fas fa-arrow-left me-2"></i> {/* Icône de retour */}
        Retour
      </button>

      <h2 className="mb-3 ms-3">Liste des apprenants certifiés</h2>
    </div>



      <div className="header-bar">
  {/* Bouton d'ajout de certification */}
  <button className="btn-create" onClick={openAddModal}>
    <i className="fas fa-plus"></i> <span>Nouvelle certification</span>
  </button>

  {/* Barre de recherche */}
  <div className="search-bar">
    <input
      type="text"
      placeholder="Rechercher une certification..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="search-input"
    />
    <button className="search-btn">
      <i className="fas fa-search"></i>
    </button>
  </div>
</div>

      <div className="card-body px-0 pt-0 pb-2">
        <div className="table-responsive p-0">
          <table className="table align-items-center mb-0">
            <thead>
              <tr>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">#id</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Apprenant</th>
                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Formation</th>
                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date de certification</th>
                <th className="text-secondary opacity-7">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertifications.length > 0 ? (
                filteredCertifications.map((certification) => (
                  <tr key={certification.id}>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{certification.id}</p>
                    </td>
                    <td>
                      <p className="text-xs font-weight-bold mb-0"><img 
          src={ `${import.meta.env.VITE_API_BASE_URL}/uploads/${certification.users.image}` } 
          alt={certification.users.name} 
          className="avatar avatar-sm me-3 fixed-image" 
        /> {certification.users.name || 'N/A'}</p>
                    </td>
                    <td className="align-middle text-center text-sm">
  <p className="text-xs font-weight-bold mb-0">
    {certification.formations.name || 'N/A'}
  </p>


</td>

                    <td className="align-middle text-center text-sm">
                      <p className="text-xs font-weight-bold mb-0">{certification.obtention_date}</p>
                    </td>
                    <td className="align-middle">
  <button className="btn btn-primary me-2" onClick={() => openEditModal(certification)}>
    <i className="fas fa-edit"></i> 
  </button>
  <button className="btn btn-danger me-2" onClick={() => openDeleteModal(certification)}>
    <i className="fas fa-trash"></i> 
  </button>
  <button className="btn btn-warning" onClick={() => handleShowClick(certification)}>
  <i class="fas fa-certificate"></i>
                      </button>
</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Aucun résultat trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

        </React.Fragment>
    );
}

export default Certification;
