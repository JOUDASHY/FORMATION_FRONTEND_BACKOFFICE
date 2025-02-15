import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fond sombre et flou
        backdropFilter: 'blur(1px)', // Applique un effet de flou
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

const Formtion_list_page = () => {
    const [formations, setFormations] = useState([]);
    const [modules, setModules] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedFormation, setSelectedFormation] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Récupération des formations
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/PresentationFormation`)
            .then(response => {
                if (response.data.results) {
                    setFormations(response.data.results);
                } else {
                    setError('Aucune formation trouvée.');
                }
            })
            .catch(err => {
                setError('Une erreur est survenue lors de la récupération des formations.');
            });

        // Récupération des modules
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

    const filteredFormations = formations.filter(formation => {
        const searchString = `${formation.name} ${formation.description} ${formation.tariff}`.toLowerCase();
        return searchString.includes(searchQuery.toLowerCase());
    });

    const filteredModules = selectedFormation
        ? modules.filter(module => module.formation_id === selectedFormation.id)
        : [];

    if (error) {
        return <div>{error}</div>; 
    }

    return (
        <>
            <div className="page-heading">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="header-text">
                                <h2>Les Formations Disponibles</h2>
                                <div className="div-dec"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                <div className="row text-center mb-5">
                    <h1 className="display-4 text-primary font-weight-bold">
                        Découvrez nos formations <p className="lead text-muted">et commencez votre parcours d'apprentissage dès aujourd'hui.</p>
                    </h1>
                </div>

{/* Barre de recherche avec l'icône à l'intérieur de l'input, sans radius sur le côté gauche */}
<div className="row mb-5">
    <div className="col-12 d-flex justify-content-center">
        <div className="input-group" style={{ maxWidth: '600px', width: '100%' }}>
            <span className="input-group-text bg-primary text-white" style={{ borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px' }}>
                <i className="fas fa-search" style={{ fontSize: '18px' }}></i>
            </span>
            <input
                type="text"
                className="form-control py-3 px-4"
                placeholder="Recherchez une formation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                    borderTopLeftRadius: '0',  // Pas de border-radius à gauche
                    borderBottomLeftRadius: '0',  // Pas de border-radius à gauche
                    borderTopRightRadius: '50px',  // Radius sur le coin supérieur droit
                    borderBottomRightRadius: '50px',  // Radius sur le coin inférieur droit
                    borderLeft: 'none',  // Supprimer la bordure gauche
                    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    fontSize: '16px',
                }}
                onFocus={(e) => e.target.style.boxShadow = '0px 6px 20px rgba(0, 0, 0, 0.15)'}
                onBlur={(e) => e.target.style.boxShadow = '0px 4px 15px rgba(0, 0, 0, 0.1)'}
            />
        </div>
    </div>
</div>



                {/* Liste des formations filtrées */}
                <div className="row">
    {filteredFormations.map(formation => (
        <div className="col-lg-3 col-md-4 col-sm-6 mb-3" key={formation.id}>
            <div
                className="card shadow-lg border-0 rounded-4 h-100 overflow-hidden transition-all transform hover:scale-105"
                style={{ height: '300px' }} // Taille ajustée
            >
                {formation.image && (
                    <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/storage/${formation.image}`}
                        alt={formation.name}
                        className="card-img-top"
                        style={{
                            height: '150px', // Image réduite
                            objectFit: 'cover',
                            borderTopLeftRadius: '10px',
                            borderTopRightRadius: '10px',
                        }}
                    />
                )}
                <div className="card-body d-flex flex-column p-3">
                    <h6 className="card-title text-uppercase font-weight-bold text-primary">
                        {formation.name}
                    </h6>
                    {/* <p className="card-text text-muted small mb-2">
                        {formation.description}
                    </p> */}
                    <div className="mt-auto d-flex justify-content-between">
                        <button
                            className="btn btn-outline-primary btn-sm px-3 py-1 shadow-sm hover:bg-primary hover:text-white transition-colors"
                            onClick={() => openModal(formation)}
                        >
                            <i className="fas fa-info-circle"></i> Détails
                        </button>
                        <button
                            className="btn btn-success btn-sm px-3 py-1 shadow-sm hover:bg-dark hover:text-white transition-colors"
                            onClick={() => handleInscription(formation.id)}
                        >
                            <i className="fas fa-user-plus"></i> S'inscrire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ))}
</div>

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
                      {selectedFormation.description}. Cette formation débute le {selectedFormation.start_date}, dure {selectedFormation.duration} jours, et est proposée au tarif de {selectedFormation.tariff} Ar durant toute la formation.
        
                         
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
        </>
    );
};

export default Formtion_list_page;
