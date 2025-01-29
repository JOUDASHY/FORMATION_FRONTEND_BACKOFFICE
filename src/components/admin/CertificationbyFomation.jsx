import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Select from 'react-select';
import { Link,useParams } from 'react-router-dom';

import { NavLink, useNavigate } from 'react-router-dom';

import CertificationModal from './CertificationModal';
import axiosClient from '../../axiosClient';

Modal.setAppElement('#root');

function Certification() {
  const [selectedStudents, setSelectedStudents] = useState([]);

    const [selectedCertification, setSelectedCertification] = useState(null);
    const [id, setId] = useState('');
    const [user_id, setUser_id] = useState("");
    const [formation_id, setFormation_id] = useState("");
    const { formationId } = useParams();
    const [obtention_date, setObtention_date] = useState("");
    const [users, setUsers] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [formationName, setFormationName] = useState([]);
    
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
  }, [formationId]);
  
  async function Load() {
      // Récupérer les étudiants inscrits à la formation
      const usersResult = await axiosClient.get(`/formations/${formationId}/users`);
      const users = usersResult.data.users;
  
      // Récupérer les certifications associées à la formation
      const certificationsResult = await axiosClient.get(`/certificationByFormation?formation_id=${formationId}`);
      const certifications = certificationsResult.data.results;
  
      setUsers(users);
      setCertifications(certifications);
  }


  useEffect(() => {
    // Récupérer le tarif de la formation en fonction de l'ID
    const fetchFormationName = async () => {
        try {
            const response = await axiosClient.get(`/formations/${formationId}`);
            // setFormationTariff(response.data.formation.tariff); // Supposons que le tarif est renvoyé sous la clé "tariff"
            setFormationName(response.data.formation.name); // Supposons que le tarif est renvoyé sous la clé "tariff"
            // console.log("Formation tariff: " + response.data.formation.tariff)
        } catch (err) {
            console.error("Erreur lors de la récupération du tarif de la formation:", err);
        }
    };

    fetchFormationName();
}, [formationId]);


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


 
    const handleCertificationChange = (e, student) => {
      if (e.target.checked) {
        // Ajouter à la liste des étudiants sélectionnés
        setSelectedStudents([...selectedStudents, student]);
      } else {
        // Retirer de la liste des étudiants sélectionnés
        setSelectedStudents(selectedStudents.filter(item => item.id !== student.id));
      }
    };
    
    const certifyStudents = async () => {
      try {
        // Soumettre la certification pour les étudiants sélectionnés
        for (const student of selectedStudents) {
          const formData = new FormData();
          formData.append('user_id', student.id);
          formData.append('formation_id', formationId);
          formData.append('obtention_date', new Date().toISOString().split('T')[0]);
    
          console.log("Données envoyées :", formData);
          await axiosClient.post("/certifications", formData, {
            headers: { 'Content-Type': "multipart/form-data" },
          });
        }
        toast.success("Certifications enregistrées avec succès");
        resetForm(); // Réinitialiser le formulaire après l'ajout réussi
      } catch (err) {
        // Vérifier si le backend a retourné un message d'erreur
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(`Erreur : ${err.response.data.message}`);
        } else {
          // Erreur générique si aucun message n'est disponible
          toast.error("Erreur lors de l'enregistrement des certifications");
        }
      }
    };
    
    
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
        toast.success('certificat retiré avec succès');
    }

    const resetForm = () => {
        setId("");
        setUser_id('');
        setFormation_id('');
        setObtention_date('');
        setSelectedStudents([]);  // Réinitialiser la sélection

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
    
    
    

    const filteredStudents = users.filter(user => {
      const userName = user.name || '';
      return userName.toLowerCase().includes(searchQuery.toLowerCase());
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
    <form onSubmit={selectedCertification ? update : null}>

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
        <p>Voulez-vous retirer le certificat de {selectedCertification?.name} ?</p>
        <div className="modal-footer justify-content-center">
            <button className='btn btn-danger' onClick={() => Deletecertification(selectedCertification?.id)}>
                <i className="fas fa-trash"></i> Retirer
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
      <div className="card-header pb-0">
        <h2>Liste des étudiants inscrits à la formation {formationName} avec ses certificats</h2>
      </div>

      <div className="header-bar d-flex align-items-center">
          {/* Bouton d'ajout de certification */}
  <button
    className="btn-create me-3"
    onClick={certifyStudents}
    disabled={selectedStudents.length === 0}
    title={selectedStudents.length === 0 ? "Veuillez choisir des apprenants avant de certifier" : "Cliquez ici pour certifier les étudiants sélectionnés"}
  >
    <i className="fas fa-certificate"></i> {/* Icône de certificat */}
    <span>Certifier les étudiants sélectionnés</span>
  </button>
  {/* Barre de recherche */}
  <div className="search-bar me-3">
    <input
      type="text"
      placeholder="Rechercher un étudiant..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="search-input"
    />
    <button className="search-btn">
      <i className="fas fa-search"></i>
    </button>
  </div>



  <NavLink to="/Certification" className="btn btn-primary">
    <i className="fas fa-graduation-cap me-2"></i> 
    Voir toutes les formations
  </NavLink>
</div>


      <div className="card-body px-0 pt-0 pb-2">
        <div className="table-responsive p-0">
          <table className="table align-items-center mb-0">
            <thead>
              <tr>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">#ID</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Étudiant</th>
                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Formation</th>
                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date de certification</th>
                <th className="text-secondary opacity-7">Statut</th>
                <th className="text-secondary opacity-7">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  // Vérification si l'étudiant est certifié
                  const certification = certifications.find(cert => cert.user_id === student.id);
                  const isCertified = certification ? true : false;

                  return (
                    <tr key={student.id}>
                      <td>
                        <p className="text-xs font-weight-bold mb-0">{student.id}</p>
                      </td>
                      <td>
                        <p className="text-xs font-weight-bold mb-0"><img 
          src={ `${import.meta.env.VITE_API_BASE_URL}/uploads/${student.image}` } 
          alt={student.name} 
          className="avatar avatar-sm me-3 fixed-image" 
        />  {student.name || 'N/A'}</p>
                      </td>
                      <td className="align-middle text-center text-sm">
                        <p className="text-xs font-weight-bold mb-0">{formationName}</p>
                      </td>
                      <td className="align-middle text-center text-sm">
                        <p className="text-xs font-weight-bold mb-0">{isCertified ? certification.obtention_date : 'Non certifié'}</p>
                      </td>
                      <td className="align-middle text-center">
                        {isCertified ? <span className="badge bg-success">Certifié</span> : <span className="badge bg-warning">Non certifié</span>}
                      </td>
                      <td className="align-middle">
  {isCertified ? (
    <button
      className="btn btn-primary me-2 mt-3"
      onClick={() => openEditModal(certification)}
      title="Modifier la certification de l'étudiant"
    >
      <i className="fas fa-edit"></i>
    </button>
  ) : (
    <input
      type="checkbox"
      onChange={(e) => handleCertificationChange(e, student)}
      className="me-2"
      title="Cochez pour certifier cet étudiant"
    />
  )}
  
  {isCertified && (
    <>
      <button
        className="btn btn-danger me-2 mt-3"
        onClick={() => openDeleteModal(certification)}
        title="Supprimer la certification de l'étudiant"
      >
        <i className="fas fa-trash"></i>
      </button>
      <button
        className="btn btn-warning mt-3"
        onClick={() => handleShowClick(certification)}
        title="Voir les détails de la certification"
      >
        <i className="fas fa-certificate"></i>
      </button>
    </>
  )}
</td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Aucun résultat trouvé</td>
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
