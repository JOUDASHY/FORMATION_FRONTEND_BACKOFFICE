import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Select from 'react-select';
import axiosClient from '../../axiosClient';
import { Link,useParams } from 'react-router-dom';
import { NavLink, useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

function InscriptionbyFomation() {
  const statue = [
    { value: 'non payée', label: 'non payée' },
    { value: 'en cours', label: 'en cours' },
    { value: 'payée', label: 'payée' }
];
    const { formationId } = useParams();

    const [selectedInscription, setSelectedInscription] = useState(null);
    const [id, setId] = useState('');
    const [user_id, setUser_id] = useState("");
    const [formation_id, setFormation_id] = useState("");
    const [payment_state, setPayment_state]= useState('');
    // const [inscription_date, setInscription_date] = useState("");
    const [payed, setPayed] = useState("");
    const [montant, setMontant] = useState("");
    const [type_paiement, setType_paiement] = useState("");
    const [inscriptions, setInscriptions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [formationTariff, setFormationTariff] = useState(0); 
    const [formationName, setFormationName] = useState(0); 
    const [searchQuery, setSearchQuery] = useState(''); // Nouvel état pour la barre de recherche

    const [options, setOptions] = useState([]);

    const [usersOptions, setUsersOptions] = useState([]);
    const [selectedFormation, setSelectedFormation] = useState(null); // Formation sélectionnée

    const [formationsMap, setFormationsMap] = useState({});
    const [usersMap, setUsersMap] = useState({});
    const getStatusBackgroundColor = (paymentState) => {
      switch (paymentState) {
        case 'payée':
          return '#4CAF50'; // Green for paid
        case 'en cours':
          return '#FFC107'; // Yellow for in progress
        case 'non payée':
          return '#F44336'; // Red for not paid
        default:
          return 'transparent'; // Default background color
      }
    };
    
    useEffect(() => {
        (async () => await Load())();
    }, [formationId]);

    async function Load() {
        const result = await axiosClient.get(`/InscriptionbyFomation?formation_id=${formationId}`);
        setInscriptions(result.data.results);
        
    }
  

    const handleClose = () => {
        setNotification(null);
    };

    const handleEditClick = (inscription) => {
        setSelectedInscription(inscription);
        setUser_id(inscription.user_id);
        // setFormation_id(inscription.formation_id);
        // setInscription_date(inscription.inscription_date);
        setId(inscription.id);
        // setPayment_state(inscription.payment_state);
        setPayed(inscription.payed);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        resetForm(); // Réinitialiser le formulaire avant d'ouvrir le modal d'ajout
        setIsModalOpen(true);
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
    async function fetchFormations() {
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
  
    fetchFormations();
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
      async function fetchFormations() {
          try {
              const response = await axiosClient.get('/formations');
              const formattedOptions = response.data.results.map((formation) => ({
                  value: formation.id,  // Utiliser l'id pour la valeur
                  label: `${formation.name} (${formation.tariff} Ar)` 
              }));
              setOptions(formattedOptions);
          } catch (error) {
              console.error('Erreur lors de la récupération des formations:', error);
          }
      }
      fetchFormations();
  }, []);

  useEffect(() => {
    // Récupérer le tarif de la formation en fonction de l'ID
    const fetchFormationTariff = async () => {
        try {
            const response = await axiosClient.get(`/formations/${formationId}`);
            setFormationTariff(response.data.formation.tariff); // Supposons que le tarif est renvoyé sous la clé "tariff"
            setFormationName(response.data.formation.name); // Supposons que le tarif est renvoyé sous la clé "tariff"
            // console.log("Formation tariff: " + response.data.formation.tariff)
        } catch (err) {
            console.error("Erreur lors de la récupération du tarif de la formation:", err);
        }
    };

    fetchFormationTariff();
}, [formationId]);


    async function editInscription(inscription) {
        setUser_id(inscription.user_id);
        setFormation_id(inscription.formation_id);
        // setInscription_date(inscription.inscription_date);
        setId(inscription.id);
        // setPayment_state(inscription.payment_state);
        setPayed(inscription.payed);
        
    }
    async function save(event) {
      event.preventDefault();
      try {
        // FormData
        const formData = new FormData();
        formData.append('user_id', user_id);
        formData.append('formation_id', formationId);
        formData.append('payed', payed);
        formData.append('type_paiement', 'espece');
    
        // Envoi de la requête
        await axiosClient.post(
          "/inscriptions", 
          formData, 
          {
            headers: { 'Content-Type': "multipart/form-data" },
          }
        );
    
        resetForm();
        toast.success("Inscription enregistrée avec succès");
      } catch (err) {
        // Vérifier si une réponse d'erreur est présente
        if (err.response && err.response.data && err.response.data.message) {
        resetForm();
          
          toast.error(err.response.data.message);
           // Affiche le message du serveur
        } else {
        resetForm();
          
          toast.error("Échec de l'enregistrement de l'inscription");
        }
        console.error(err); // Pour le débogage
      }
    }
    

    async function pay(event) {
      event.preventDefault();
      try {
        
        // formdata
        const formData= new FormData();
        formData.append('montant', montant);
        formData.append('type_paiement', 'espèce');
        formData.append('id',id);
        // formData.append('payment_state', payment_state);

   
  
        // formData.append('inscription_date', inscription_date);

        await axiosClient.post(`/inscriptions/${id}/paiement`,
          
          formData
        
          
        );
    
        resetForm();
        toast.success("Payement avec succès");
         // Réinitialiser le formulaire après l'ajout réussi
        
      } catch (err) {
  
        toast.error("Échec de Payement de l'inscription");
      }
    }




    async function update(event) {
      event.preventDefault();
      try {
          const formData = {
              user_id,
              formation_id: formationId, // Utilisation correcte de l'affectation
              payed, // Assurez-vous que `payed` est défini dans votre état ou contexte
          };
  
          // Envoi de la requête PUT avec les données
          await axiosClient.put(`/inscriptions/${id}`, formData);
  
          // Réinitialisation du formulaire après succès
          resetForm();
          toast.success('Inscription mise à jour');
      } catch (err) {
          // Gestion des erreurs
          toast.error('Échec de la mise à jour de l\'inscription');
      }
  }
  

    async function DeleteInscription(id) {
        await axiosClient.delete(`/inscriptions/${id}`);
        resetForm();
        toast.success('inscription supprimée avec succès');
    }

    const resetForm = () => {
        setId("");
        setMontant("");
        setUser_id('');
        // setFormation_id('');
        // setInscription_date('');
        setPayment_state('');
        setPayed('');
        setSelectedInscription(null);
        Load();
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsPayModalOpen(false);
    };

    const openDeleteModal = (inscription) => {
        setSelectedInscription(inscription);
        setIsDeleteModalOpen(true); 
    };


    const openPayModal = (inscription) => {
      setId(inscription.id);
      setMontant(inscription.payed);
      setSelectedInscription(inscription);
      setIsPayModalOpen(true); 
  };



    const filteredInscriptions = inscriptions.filter(inscription => {
        const user = usersOptions.find(user => user.value === inscription.user_id);
        const formation = options.find(formation => formation.value === inscription.formation_id);
    
        const userName = user ? user.label : '';
        const formationName = formation ? formation.label : '';
    
        return (
            userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            formationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inscription.payment_state.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inscription.inscription_date.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });
    const handleChange_stat = (selectedOption) => {
      setPayment_state(selectedOption ? selectedOption.value : '');
  };

    return (
        <React.Fragment>
                      <ToastContainer />

      

                      <Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isPayModalOpen} 
    onRequestClose={() => setIsPayModalOpen(false)}
>
    <div className="modal-header">
        <h4>Payement de inscription</h4>
      
    </div>
    <div className="modal-body">
        <form onSubmit={pay}>


        <p>
        Êtes-vous sûr de vouloir vous payer à cette formation ?
      </p>
      <p>
        Montant rest à payer : <strong>{montant} Ar</strong>
      </p>
      <input type="hidden" value={id} />
      <input type="hidden" value={montant} />

            <div className="modal-footer">
                <button 
                    type="submit" 
                    className={ 'btn btn-primary'}
                >
                        <>    <i className="fas fa-credit-card"></i> Payer</>
             
                </button>
                <button 
                    className='btn btn-secondary' 
                    type="button" 
                    onClick={() => resetForm()}
                >
                    <i className="fas fa-times"></i> Annuler
                </button>
            </div>
        </form>
    </div>
</Modal>




                    {/* Modal pour ajouter ou éditer une inscription */}
                    <Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isModalOpen} 
    onRequestClose={() => setIsModalOpen(false)}
>
    <div className="modal-header">
        <h4> Ajouter une inscription </h4>
    </div>
    <div className="modal-body">
        <form onSubmit={ save}>
        
            {/* <div className="form-group">
                <label htmlFor="formation">Formation</label>
                <Select
                    value={options.find(option => option.value === formation_id)} 
                    onChange={handleChange}
                    options={options}
                    placeholder="Choisir une formation"
                    className="customSelect"
                    classNamePrefix="custom-select"
                />
            </div> */}

            <div className="form-group">
                <label htmlFor="user">Apprenant</label>
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
    <label htmlFor="montant">Montant</label>

    <div className="payment-options">
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="radio"
                    name="payedOption"
                    id="fiftyPercent"
                    value={formationTariff * 0.5}
                    checked={payed === formationTariff * 0.5}
                    onChange={(e) => setPayed(parseInt(e.target.value))}
                />
                <label className="form-check-label" htmlFor="fiftyPercent">
                    50% ({formationTariff * 0.5} Ar)
                </label>
            </div>

            <div className="form-check">
                <input
                    className="form-check-input"
                    type="radio"
                    name="payedOption"
                    id="fullPayment"
                    value={formationTariff}
                    checked={payed === formationTariff}
                    onChange={(e) => setPayed(parseInt(e.target.value))}
                />
                <label className="form-check-label" htmlFor="fullPayment">
                    100% ({formationTariff} Ar)
                </label>
            </div>
        </div>
</div>



            <div className="modal-footer">
                <button 
                    type="submit" 
                    className= 'btn btn-success'
                >
                    
               
                        <><i className="fas fa-plus"></i> Ajouter</>
                 
                </button>
                <button 
                    className='btn btn-secondary' 
                    type="button" 
                    onClick={() => resetForm()}
                >
                    <i className="fas fa-times"></i> Annuler
                </button>
            </div>
        </form>
    </div>
</Modal>

<Modal
    overlayClassName="modal-overlay"
    className="customModal"
    isOpen={isDeleteModalOpen}
    onRequestClose={() => setIsDeleteModalOpen(false)}
>
    <div className="modal-body">
        <p>Voulez-vous supprimer l'inscription {selectedInscription?.name} ?</p>
        <div className="modal-footer">
            <button 
                className="btn btn-danger" 
                onClick={() => DeleteInscription(selectedInscription?.id)}
            >
                <i className="fas fa-trash"></i> Supprimer
            </button>
            <button 
                className="btn btn-secondary" 
                onClick={() => resetForm()}
            >
                <i className="fas fa-times"></i> Annuler
            </button>
        </div>
    </div>
</Modal>

<div className="row">
  <div className="col-12">
    <div className="card mb-4">
      <div className="card-header pb-0">
        <h2>Liste des étudiants inscrits dans la formation {formationName}</h2>
      </div>
      
      <div className="header-bar d-flex align-items-center">
        {/* Bouton pour ajouter une inscription */}
        <button className="btn-create me-2" onClick={handleAddClick}>
          <i className="fas fa-plus"></i> <span> Nouvelle inscription</span>
        </button>
        
        {/* Barre de recherche */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher une inscription"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>


        <NavLink to="/Inscription" className="btn btn-primary">
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
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Apprenant</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Formation inscrite</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">État de paiement</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date d'inscription</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Montant payé</th>
                <th className="text-secondary opacity-7">Retirer</th>
                <th className="text-secondary opacity-7">Payer</th>
                
              </tr>
            </thead>

            <tbody>
              {filteredInscriptions.length > 0 ? (
                filteredInscriptions.map((inscription) => (
                  <tr key={inscription.id}>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{inscription.id}</p>
                    </td>
                    <td>
                      <p className="text-xs font-weight-bold mb-0"><img 
          src={ `${import.meta.env.VITE_API_BASE_URL}/uploads/${inscription.users.image}` } 
          alt={inscription.users.name} 
          className="avatar avatar-sm me-3 fixed-image" 
        /> {inscription.users.name}</p>
                    </td>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{inscription.formations.name}</p>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: getStatusBackgroundColor(inscription.payment_state),
                          borderRadius: '5px',
                          padding: '5px',
                          color: 'black',
                        }}
                      >
                        {inscription.payment_state}
                      </span>
                    </td>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{inscription.inscription_date}</p>
                    </td>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{inscription.payed}</p>
                    </td>
                <td className="align-middle">

  <button className="btn btn-danger" onClick={() => openDeleteModal(inscription)}>
    <i className="fas fa-trash"></i> 
  </button>
</td>

<td className="align-middle">
  <button className="btn btn-info" disabled={inscription.payment_state==='payée'} onClick={() => openPayModal(inscription)}>
    <i className="fas fa-credit-card"></i> 
  </button>
</td>


                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>Aucun résultat trouvé</td>
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

export default InscriptionbyFomation;
