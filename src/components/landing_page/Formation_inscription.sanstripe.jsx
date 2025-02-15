import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
const Formation_inscription = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [payed, setPayed] = useState(0);
    const type = 'apprenant';
    const [formationTariff, setFormationTariff] = useState(null);
    const { formationId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFormation = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/formations/${formationId}`);
                setFormationTariff(response.data.formation.tariff);
            } catch (error) {
                toast.error("Impossible de récupérer le tarif de la formation.");
            }
        };

        fetchFormation();
    }, [formationId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let payment_state = 'Non payée';
        if (payed > 0 && payed < formationTariff) {
            payment_state = 'En cours';
        } else if (payed === formationTariff) {
            payment_state = 'Payée';
        }
    
        try {
            const userResponse = await axios.post('http://127.0.0.1:8000/api/users', {
                name,
                email,
                contact,
                type
            });
    
            const userId = userResponse.data.user.id;
            if (!userId) {
                toast.error("Impossible de récupérer l'ID de l'utilisateur.");
                return;
            }
    
            await axios.post('http://127.0.0.1:8000/api/inscriptions', {
                user_id: userId,
                formation_id: formationId,
                payed,
                payment_state,
                inscription_date: new Date().toISOString().split('T')[0],
            });
    
            // toast.success('Inscription réussie !');
            Swal.fire({
                title: "Bravo !",
                text: "Inscription réussie ! Veuillez visiter votre boîte mail pour activer votre compte en mettant votre mot de passe !",
                icon: "success"
            });
            
           
                navigate('/');
            
    
        } catch (error) {
            toast.error("Une erreur est survenue lors de l'inscription.");
            Swal.fire({
                title: "Oops ...",
                text: "Une erreur est survenue lors de l'inscription.",
                icon: "error"
            });
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="page-heading">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="header-text">
                                <h2>Inscription à la Formation</h2>
                                <div className="div-dec"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ***** Inscription Form ***** */}
            <section className="contact-us-form">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3">
                            <div className="section-heading">
                                <h6>Inscrivez-vous</h6>
                                <h4>Remplissez le formulaire ci-dessous</h4>
                            </div>
                        </div>
                        
                        <div className="col-lg-10 offset-lg-1">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-lg-6 mb-3"> {/* Ajout de la classe mb-3 pour espace */}
                                        <fieldset>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Votre Nom"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </fieldset>
                                    </div>

                                    <div className="col-lg-6 mb-3"> {/* Ajout de la classe mb-3 pour espace */}
                                        <fieldset>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="Votre E-mail"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </fieldset>
                                    </div>
                                    
                                    <div className="col-lg-6 mb-3"> {/* Ajout de la classe mb-3 pour espace */}
                                        <fieldset>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Votre Contact"
                                                value={contact}
                                                onChange={(e) => setContact(e.target.value)}
                                                required
                                            />
                                        </fieldset>
                                    </div>
                                    
                                    <div className="col-lg-6 mb-3"> {/* Ajout de la classe mb-3 pour espace */}
                                        <fieldset>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Montant Payé"
                                                value={payed}
                                                onChange={(e) => setPayed(parseInt(e.target.value))}
                                                required
                                            />
                                        </fieldset>
                                    </div>

                                    <div className="col-lg-12">
                                        <fieldset>
                                            <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-user-plus"></i> S'inscrire
                                            </button>
                                        </fieldset>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Formation_inscription;
