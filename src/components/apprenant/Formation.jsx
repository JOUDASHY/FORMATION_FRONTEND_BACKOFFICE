import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../axiosClient';
import ClipLoader from 'react-spinners/ClipLoader';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Swal from 'sweetalert2';
import CertificationModal from '../admin/CertificationModal';

const stripePromise = loadStripe('pk_test_51QKJJnGEhTpV5xSFjWUc9PanYP5pveU1pG1Q5zQ1pCzE9DnktmzOTNu0ypmBX3qtcorKpXaQi6BcJReOJtv95rZa00UMly1kcQ'); // Remplacez ceci par votre clé publique Stripe

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // Fond sombre et flou
        backdropFilter: 'blur(10px)', // Applique un effet de flou
        zIndex: 9999, 
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '600px',
        width: '90%',
        borderRadius: '20px', // Correction du typo 'borderRaduis'
    },
};

const FormationInscriptionWithStripe = ({ user }) => {
    const [refresh, setRefresh] = useState(false);

    const [formations, setFormations] = useState([]);
    const [presentationFormation, setPresentationFormation] = useState([]);
    
    const [modules, setModules] = useState([]);
    const [id, setId] = useState('');
    const [montant, setMontant] = useState('');
    const [type_paiement, setType_paiement] = useState('');
    
    const [payed, setPayed] = useState('');
    const [inscriptions, setInscriptions] = useState([]);
    const [error, setError] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
    const [payModalIsOpen, setPayModalIsOpen] = useState(false);
    const [selectedFormation, setSelectedFormation] = useState(null);
    
    const [certifications, setCertifications] = useState([]);
    const [options, setOptions] = useState([]);

    const [isQuitModalOpen, setQuitModalOpen] = useState(false);
    const [inscription, setInscription] = useState(null);
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
    const [selectedCertificateData, setSelectedCertificateData] = useState(null);
    const [usersMap, setUsersMap] = useState({});

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
    const openQuitModal = (inscription) => {
        setInscription(inscription);
        setQuitModalOpen(true);
    };

    const closeQuitModal = () => {
        setQuitModalOpen(false);
        setInscription(null);
    };

    const confirmQuitInscription = () => {
        if (inscription) {
            // Exemple de requête axios pour supprimer l'inscription
            axiosClient.delete(`/inscriptions/${inscription.id}`)
                .then(() => {
                    resetForm();

                    toast.success("Inscription supprimée avec succès.");
                   
                })
                .catch(() => {
                    toast.error("Erreur lors de la suppression de l'inscription.");
                });
        }
    };
    
    const getStatusBackgroundColor = (paymentState) => {
        switch (paymentState) {
            case 'payée':
                return '#4CAF50'; // Green for paid
            case 'en cours':
                return '#FFC107'; // Yellow for in progress
            case 'non payée':
                return '#F44336'; // Red for not paid
            default:
                return 'transparent';
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
              const fetchPresentationFormation = async () => {
                try {
                    const formationsResponse = await axiosClient.get('/formations');
                    setFormations(formationsResponse.data.results);
                    console.log("data:",formationsResponse.data.results);
      
                } catch (error) {
                    setError('Une erreur est survenue lors de la récupération des données.');
                }
            };
      
            fetchPresentationFormation();

                const modulesResponse = await axiosClient.get('/modules');
                setModules(modulesResponse.data.results);

                const inscriptionsResponse = await axiosClient.get('/inscriptions');
                setInscriptions(inscriptionsResponse.data.results);
            } catch (error) {
                setError('Une erreur est survenue lors de la récupération des données.');
            }
        };

        fetchData();
        LoadCertificat();
    }, [refresh]);

    useEffect(() => {
      const fetchPresentationFormation = async () => {
          try {
              const formationsResponse = await axiosClient.get('/PresentationFormation');
              setPresentationFormation(formationsResponse.data.results);
              console.log("data:",formationsResponse.data.results);

          } catch (error) {
              setError('Une erreur est survenue lors de la récupération des données.');
          }
      };

      fetchPresentationFormation();
      // LoadCertificat();
  }, []);


    async function LoadCertificat() {
      const result = await axiosClient.get("/indexForUser");
      setCertifications(result.data.results);
      
  }
    const openModal = (formation) => {
        setSelectedFormation(formation);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const openConfirmModal = (formation) => {
        setSelectedFormation(formation);
        setConfirmModalIsOpen(true);
    };

    const openPayModal = (inscription) => {
        setId(inscription.id);
        setMontant(inscription.payed);

        setPayModalIsOpen(true);
    };


    const closeConfirmModal = () => {
        setConfirmModalIsOpen(false);
    };
    const closePayModal = () => {
        setPayModalIsOpen(false);
    };
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

const handleConfirmInscription = async () => {
    setLoading(true); // Afficher le spinner
    try {
        // Vérifier si Stripe est correctement configuré
        if (stripe && elements) {
            const cardElement = elements.getElement(CardElement);
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                Swal.fire({
                    title: "Erreur de paiement",
                    text: "Erreur : " + error.message,
                    icon: "error",
                });
                setLoading(false);
                return;
            }

            // Processus de paiement avec Stripe
            const paymentResponse = await axiosClient.post('/payment', {
                payment_method: paymentMethod.id,
                amount: payed, // en cents
            });
            console.log('Payment Method:', paymentMethod.id);
            console.log('Amount:', payed );

            if (paymentResponse.data.success) {
                const inscriptionData = {
                    user_id: user.id,
                    formation_id: selectedFormation.id,
                    payed: payed,
                    type_paiement:'carte bancaire',
                    inscription_date: new Date().toISOString().slice(0, 10),
                    // payment_state: 'payée',  // Marque le paiement comme effectué
                };

                try {
                    const inscriptionResponse = await axiosClient.post('/inscriptions', inscriptionData);
                    setInscriptions([...inscriptions, inscriptionData]);
                    closeConfirmModal();
                    
                    Swal.fire({
                        title: "Inscription réussie",
                        text: "Votre inscription a été effectuée avec succès. Veuillez consulter votre boîte mail pour activer votre compte.",
                        icon: "success",
                    });
                    resetForm();

                } catch (err) {
                    Swal.fire({
                        title: "Erreur lors de l'inscription",
                        text: "Une erreur est survenue, réessayez.",
                        icon: "error",
                    });
                }

            } else {
                Swal.fire({
                    title: "Erreur de paiement",
                    text: "Le paiement a échoué. Veuillez réessayer.",
                    icon: "error",
                });
            }
        }
    } catch (error) {
        console.error('Erreur principale :', error);
        Swal.fire({
            title: "Oops ...",
            text: "Une erreur est survenue lors de l'inscription.",
            icon: "error"
        });
    } finally {
        setLoading(false); // Masquer le spinner
    }
};

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

const handlePayInscription = async () => {
  setLoading(true); // Afficher le spinner
  try {
      if (stripe && elements) {
          const cardElement = elements.getElement(CardElement);
          const { paymentMethod, error } = await stripe.createPaymentMethod({
              type: 'card',
              card: cardElement,
          });

          if (error) {
              Swal.fire({
                  title: "Erreur de paiement",
                  text: "Erreur : " + error.message,
                  icon: "error",
              });
              setLoading(false);
              return;
          }

          // Processus de paiement avec Stripe
          const paymentResponse = await axiosClient.post('/payment', {
              payment_method: paymentMethod.id,
              amount: montant, // en cents
          });

          if (paymentResponse.data.success) {
              const type_paiement = 'carte bancaire'; // Définir explicitement ici
              const inscriptionData = {
                  inscription_id: id,
                  montant: montant,
                  type_paiement, // Inclure type_paiement dans l'objet
              };

              console.log('Type de paiement :', type_paiement);

              try {
                  const inscriptionResponse = await axiosClient.post(`/inscriptions/${id}/paiement`, inscriptionData);
                  setInscriptions([...inscriptions, inscriptionData]);
                  resetForm();

                  Swal.fire({
                      title: "Paiement réussi",
                      text: "Votre paiement a été effectué avec succès. Veuillez consulter votre boîte mail pour activer votre compte.",
                      icon: "success",
                  });

              } catch (err) {
                  resetForm();

                  Swal.fire({
                      title: "Erreur lors du paiement",
                      text: "Une erreur est survenue, réessayez.",
                      icon: "error",
                  });
              }
          } else {
              resetForm();

              Swal.fire({
                  title: "Erreur de paiement",
                  text: "Le paiement a échoué. Veuillez réessayer.",
                  icon: "error",
              });
          }
      }
  } catch (error) {
      resetForm();

      console.error('Erreur principale :', error);
      Swal.fire({
          title: "Oops ...",
          text: "Une erreur est survenue lors du paiement.",
          icon: "error"
      });
  } finally {
      setLoading(false); // Masquer le spinner
  }
};


    
const resetForm = () => {
    setId("");
    setMontant("");
    // setUser_id('');
    setPayed('');
    // setSelectedInscription(null);
setSelectedFormation(null);
    setRefresh(prev => !prev); 
    setPayModalIsOpen(false);
    setConfirmModalIsOpen(false);
    setQuitModalOpen(false);
    setInscription(null);
    setModalIsOpen(false);
};


    const filteredModules = selectedFormation
        ? modules.filter(module => module.formation_id === selectedFormation.id)
        : [];

    const userInscriptions = inscriptions.filter(inscription => inscription.user_id === user.id);

    if (error) {
        return <div>{error}</div>;
    }


    return (
        <div>
            <ToastContainer />
            <CertificationModal 
            isOpen={isCertificateModalOpen} 
            onRequestClose={() => setIsCertificateModalOpen(false)} 
            certificateData={selectedCertificateData}
        />
<div className="text-center bg-white p-3 rounded shadow">
    <h1 className="display-4" style={{ color: "#085a94", fontWeight: "bold" }}>Formations Disponibles chez UN-IT</h1>
    <p className="lead fw-bold" style={{ color: "#2bb99a" }}>
        Découvrez nos programmes conçus pour booster vos compétences et réussir votre parcours professionnel.
        Rejoignez-nous pour une expérience d'apprentissage unique !
    </p>
</div>
    <br />
            <div className="product-container">
                {presentationFormation.map(formation => (
                    <div className="product-card" key={formation.id}>
                        <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${formation.image}`} alt={formation.name} />
                        <div className="product-info">
                            <h3 className="product-name">{formation.name}</h3>
                            <p className="price">{formation.tariff} Ar</p>
                            <p className="start-date">Début: {new Date(formation.start_date).toLocaleDateString()}</p>
                            <div className="button-container">
                            <button className="btn-details" onClick={() => openModal(formation)}>
        <i className="fas fa-info-circle"></i> info
    </button>
    <button 
    className={`btn-inscription ${userInscriptions.some(inscription => inscription.formation_id === formation.id) ? 'btn-secondary disabled' : 'btn-primary'}`} 
    onClick={() => openConfirmModal(formation)} 
    disabled={userInscriptions.some(inscription => inscription.formation_id === formation.id)}>
    
    <i className={`fas ${userInscriptions.some(inscription => inscription.formation_id === formation.id) ? 'fa-check-circle' : 'fa-user-plus'}`}></i> 
    {userInscriptions.some(inscription => inscription.formation_id === formation.id) ? 'Déjà' : 'S\'inscrire'}
</button>

</div>
                        </div>
                    </div>
                ))}


            </div>

         <br />
            {/* Table des inscriptions */}
            <div className="row">
    <div className="col-12">
        <div className="card mb-4">
            <div className="card-header pb-0">
                <h6>Mes Inscriptions</h6>
            </div>
            <div className="card-body px-0 pt-0 pb-2">
                <div className="table-responsive p-0">
                    <table className="table align-items-center mb-0">
                        <thead>
                            <tr>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Formation</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Statut</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Montant payé</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Reste à payer</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Quitter</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Payer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userInscriptions.map(inscription => {
                                const formation = formations.find(f => f.id === inscription.formation_id);
                                const montantPaye = inscription.payed || 0;
                                const resteAPayer = formation ? formation.tariff - montantPaye : 0;
                                return (
                                    <tr key={inscription.id}>
                                        <td>
                                            <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${formation.image}`} width="40px" alt={formation.name} />
                                            {formation ? formation.name : 'Formation non trouvée'}
                                        </td>
                                        <td>
                                            <span style={{ backgroundColor: getStatusBackgroundColor(inscription.payment_state), borderRadius: '5px', paddingRight: '5px', paddingLeft: '5px', color: 'black' }}>
                                                {inscription.payment_state}
                                            </span>
                                        </td>
                                        <td>{montantPaye} Ar</td>
                                        <td>{resteAPayer} Ar</td>
                                        <td>
                                            <button className="btn btn-danger" onClick={() => openQuitModal(inscription)}>
                                                <i className="fas fa-times"></i> 
                                            </button>
                                        </td>
                                        <td>
                                            <button className="btn btn-success" disabled={inscription.payment_state==='payée'} onClick={() => openPayModal(inscription)}>
                                            <i className="fas fa-credit-card"></i> 
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>


<div className="row">
  <div className="col-12">
    <div className="card mb-4">
      <div className="card-header pb-0">
      <h6>Mes certificats par formation</h6>
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
              {certifications.length > 0 ? (
                certifications.map((certification) => (
                  <tr key={certification.id}>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{certification.id}</p>
                    </td>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{certification.users.name || 'N/A'}</p>
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



                {/* Modal pour afficher les détails de la formation */}
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    ariaHideApp={false}
                    style={customStyles}

                >
                    {selectedFormation && (
                        <>
                            <div className="modal-header">
                                <h2>{selectedFormation.name}</h2>
                              
                            </div>
                            <div className="modal-body">
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/${selectedFormation.image}`}
                                    alt={selectedFormation.name}
                                    className="modal-image"
                                />
                          {selectedFormation.description}. Cette formation débute le {selectedFormation.start_date}, dure {selectedFormation.duration} jours, et est proposée au tarif de {selectedFormation.tariff} Ar durant toute la formation.
        
                                <h3>Modules</h3>
                                <ul className="modal-modules">
                                    {filteredModules.length > 0 ? (
                                        filteredModules.map((module) => (
                                            <li key={module.id}>{module.name}</li>
                                        ))
                                    ) : (
                                        <li>Aucun module trouvé</li>
                                    )}
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary"   onClick={() => resetForm()}>
                                    <i className="fas fa-times"></i> Fermer
                                </button>
                            </div>
                        </>
                    )}
                </Modal>

                {/* Modal de confirmation pour le paiement */}

                <Modal
    isOpen={payModalIsOpen}
    onRequestClose={closePayModal}
    overlayClassName="modal-overlay"
    className="custom-modal"
  >
    <div className="modal-header">
      <h2>Faire un paiement</h2>
     
    </div>
    <div className="modal-body">
      <p>
        Êtes-vous sûr de vouloir vous payer à cette formation ?
      </p>
      <p>
        Montant rest à payer : <strong>{montant} Ar</strong>
      </p>
      <input type="hidden" value={id} />
      <input type="hidden" value={montant} />

      <fieldset>
        <div className="input-group card-input-group">
          <span className="input-group-text bg-primary text-white">
            <i className="fas fa-credit-card"></i>
          </span>
          <div className="form-control" id="card">
            <CardElement options={{ hidePostalCode: true }} className="stripe-card-element" />
          </div>
        </div>
      </fieldset>
      {/* {loading && <ClipLoader color="#4A90E2" loading={loading} size={30} />} */}
    </div>
    <div className="modal-footer">
      <button
        className="btn btn-success"
        onClick={handlePayInscription}
        disabled={!stripe || loading}
      >
        {loading ? (
          <ClipLoader color="#ffffff" size={20} />
        ) : (
          <>
            <i className="fas fa-credit-card"></i> 
            payer
          </>
        )}
      </button>
      <button className="btn btn-secondary"   onClick={() => resetForm()}>
        <i className="fas fa-times-circle"></i> {/* Icône d'annulation */}
        Annuler
      </button>
    </div>

    <style jsx>{`
      .modal-overlay {
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }

      .custom-modal {
        background-color: #fff;
        border-radius: 8px;
        padding: 20px;
        max-width: 600px;
        width: 100%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: relative;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 20px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
      }

      .modal-body p {
        font-size: 16px;
        margin: 10px 0;
      }

      .input-group {
        display: flex;
        align-items: center;
        margin-top: 10px;
      }

      .input-group-text {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        font-size: 18px;
      }

      .stripe-card-element {
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 10px;
        font-size: 14px;
        margin-left: 10px;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        font-size: 16px;
        border-radius: 4px;
        cursor: pointer;
      }

      .btn-success {
        background-color: #28a745;
        color: white;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    `}</style>
  </Modal>






  <Modal
    isOpen={confirmModalIsOpen}
    onRequestClose={closeConfirmModal}
    overlayClassName="modal-overlay"
    className="custom-modal"
  >
    <div className="modal-header">
      <h2>Confirmation de paiement</h2>
     
    </div>
    <div className="modal-body">
      <p>
        Êtes-vous sûr de vouloir vous inscrire à la formation <strong>{selectedFormation?.name}</strong> ?
      </p>
      <p>
        Montant à payer : <strong>{selectedFormation?.tariff} Ar</strong>
      </p>

      <div className="form-group">
  <label htmlFor="payedOption">Montant à payer</label>
  <div className="d-flex align-items-center">
    <div className="form-check me-3">
      <input
        className="form-check-input"
        type="radio"
        name="payedOption"
        id="fiftyPercent"
        value={selectedFormation?.tariff * 0.5}
        checked={payed === selectedFormation?.tariff * 0.5}
        onChange={(e) => setPayed(parseInt(e.target.value))}
      />
      <label className="form-check-label" htmlFor="fiftyPercent">
        50% ({selectedFormation?.tariff * 0.5} Ar)
      </label>
    </div>
    <div className="form-check">
      <input
        className="form-check-input"
        type="radio"
        name="payedOption"
        id="fullPayment"
        value={selectedFormation?.tariff}
        checked={payed === selectedFormation?.tariff}
        onChange={(e) => setPayed(parseInt(e.target.value))}
      />
      <label className="form-check-label" htmlFor="fullPayment">
        100% ({selectedFormation?.tariff} Ar)
      </label>
    </div>
  </div>
</div>

      <fieldset>
        <div className="input-group card-input-group">
          <span className="input-group-text bg-primary text-white">
            <i className="fas fa-credit-card"></i>
          </span>
          <div className="form-control" id="card">
            <CardElement options={{ hidePostalCode: true }} className="stripe-card-element" />
          </div>
        </div>
      </fieldset>
      {/* {loading && <ClipLoader color="#4A90E2" loading={loading} size={30} />} */}
    </div>
    <div className="modal-footer">
      <button
        className="btn btn-success"
        onClick={handleConfirmInscription}
        disabled={!stripe || loading}
      >
        {loading ? (
          <ClipLoader color="#ffffff" size={20} />
        ) : (
          <>
            <i className="fas fa-check-circle"></i> {/* Icône de confirmation */}
            Confirmer le paiement
          </>
        )}
      </button>
      <button className="btn btn-secondary" onClick={closeConfirmModal}>
        <i className="fas fa-times-circle"></i> {/* Icône d'annulation */}
        Annuler
      </button>
    </div>

    <style jsx>{`
      .modal-overlay {
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }

      .custom-modal {
        background-color: #fff;
        border-radius: 8px;
        padding: 20px;
        max-width: 600px;
        width: 100%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: relative;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 20px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
      }

      .modal-body p {
        font-size: 16px;
        margin: 10px 0;
      }

      .input-group {
        display: flex;
        align-items: center;
        margin-top: 10px;
      }

      .input-group-text {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        font-size: 18px;
      }

      .stripe-card-element {
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 10px;
        font-size: 14px;
        margin-left: 10px;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        font-size: 16px;
        border-radius: 4px;
        cursor: pointer;
      }

      .btn-success {
        background-color: #28a745;
        color: white;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    `}</style>
  </Modal>

                        {/* Modal de confirmation de désinscription */}
            <Modal
                isOpen={isQuitModalOpen}
                onRequestClose={closeQuitModal}
                overlayClassName="modal-overlay"
                className="customModal"
            >
                <div className="modal-header">
                    <h2>Confirmation de désinscription</h2>
                    <button className="close-btn" onClick={closeQuitModal}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>Êtes-vous sûr de vouloir quitter la formation <strong>{inscription?.formation_name}</strong> ?</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-danger" onClick={confirmQuitInscription}>
                        Quitter la formation
                    </button>
                    <button className="btn btn-secondary" onClick={closeQuitModal}>
                        Annuler
                    </button>
                </div>
            </Modal>
            
        </div>
    );
};


const Formation = ({user}) => (
    <Elements stripe={stripePromise}>
        <FormationInscriptionWithStripe user={user} 
        />
    </Elements>
);

export default Formation;