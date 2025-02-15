import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000, 
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
        borderRadius: '20px',
    },
};

const FormationList = () => {
    const [formations, setFormations] = useState([]);
    const [modules, setModules] = useState([]);
    const [error, setError] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedFormation, setSelectedFormation] = useState(null);
    const navigate = useNavigate();
    const [totalFormations, setTotalFormations] = useState(0);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/PresentationFormation`)
            .then(response => {
                if (response.data.results) {
                    setTotalFormations(response.data.results.length);
                    setFormations(response.data.results.slice(0, 6));
                } else {
                    setError('Aucune formation trouvée.');
                }
            })
            .catch(err => {
                setError('Une erreur est survenue lors de la récupération des formations.');
            });

        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/modules`)
            .then(response => {
                setModules(response.data.results);
            })
            .catch(err => {
                setError('Une erreur est survenue lors de la récupération des modules.');
            });
    }, []);

    const openModal = (formation) => {
        setSelectedFormation(formation);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleInscription = (formationId) => {
        navigate(`/Formation_inscription/${formationId}`);
    };

    const goToFormationListPage = () => {
        navigate('/Formtion_list_page');
    };

    const filteredModules = selectedFormation
        ? modules.filter(module => module.formation_id === selectedFormation.id)
        : [];

    if (error) {
        return <div>{error}</div>;
    }
    const remainingFormationsCount = totalFormations > 6 ? totalFormations - 6 : 0;

    return (
        <section className="services" id="services">
            <div className="container">
                <div className="row">
                    <center><h1>Les Formations dispo chez nous</h1></center>
                    {formations.map(formation => (
                        <div className="col-lg-6" key={formation.id}>
                            <div className="service-item">
                                {formation.image && (
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/storage/${formation.image}`}
                                        alt={formation.name}
                                        style={{ width: '90px', height: '90px' }}
                                    />
                                )}
                                <h4>{formation.name}</h4>
                                {/* <p>{formation.description}</p> */}
                                <div className="button-container">
                                    <button className="btn-details" onClick={() => openModal(formation)}>
                                        <i className="fas fa-info-circle"></i> Plus de détails
                                    </button>
                                    <button
                                        className="btn-inscrit"
                                        onClick={() => handleInscription(formation.id)}
                                    >
                                        <i className="fas fa-user-plus"></i> S'inscrire
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-4">
    <button 
        className="btn btn-outline-light d-flex align-items-center justify-content-center rounded-pill" 
        onClick={goToFormationListPage}
        style={{
            backgroundColor: '#1E1E2F',
            color: '#FFFFFF',
            padding: '12px 24px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            border: '2px solid #6C63FF',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
            e.target.style.color = '#6C63FF';
            e.target.style.borderColor = '#FFFFFF';
        }}
        onMouseLeave={e => {
            e.target.style.color = '#FFFFFF';
            e.target.style.borderColor = '#6C63FF';
        }}
    >
        <span>Voir plus {remainingFormationsCount > 0 ? `(${remainingFormationsCount}+)` : ''}</span>
        <i className="fas fa-chevron-right ms-2"></i>
        <span 
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#6C63FF',
                opacity: 0,
                transition: 'opacity 0.4s',
            }}
            className="hover-bg"
        ></span>
    </button>
</div>


                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    {selectedFormation && (
                       <div className="custom-modal">
                       <div className="modal-header">
                         <h2>{selectedFormation.name}</h2>
                         <button className="close-btn" onClick={closeModal}>&times;</button>
                       </div>
                       <div className="modal-body">
                         <img
                           src={`${import.meta.env.VITE_API_BASE_URL}/storage/${selectedFormation.image}`}
                           alt={selectedFormation.name}
                           className="modal-image"
                         />
                      
{selectedFormation.description}. <br /><br />Cette formation débute le {selectedFormation.start_date}, dure {selectedFormation.duration} jours, et est proposée au tarif de {selectedFormation.tariff} Ar durant toute la formation.
                      
                         <h3>Modules inclus :</h3>
                         <ul className="modal-modules">
                           {filteredModules.length > 0 ? (
                             filteredModules.map((module) => (
                               <li key={module.id}>{module.name}</li>
                             ))
                           ) : (
                             <li>Aucun module disponible pour cette formation</li>
                           )}
                         </ul>
                       </div>
                       <div className="modal-footer">
                         <button className="action-btn" onClick={closeModal}>
                           <i className="fas fa-times"></i> Fermer
                         </button>
                       </div>
                     </div>
                     
                    )}
                </Modal>
            </div>
        </section>
    );
};

export default FormationList;
