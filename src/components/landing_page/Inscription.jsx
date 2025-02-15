import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ClipLoader } from 'react-spinners'; // Import du spinner

// Charger la clé publique Stripe
const stripePromise = loadStripe('pk_test_51QKJJnGEhTpV5xSFjWUc9PanYP5pveU1pG1Q5zQ1pCzE9DnktmzOTNu0ypmBX3qtcorKpXaQi6BcJReOJtv95rZa00UMly1kcQ'); // Remplacez ceci par votre clé publique Stripe

const Inscription_stripe = () => {

    const options = [
        { value: 'masculin', label: 'masculin' },
        { value: 'feminin', label: 'feminin' }
    ];
    const [sex, setSex]= useState('');
    const handleChange_sex = (selectedOption) => {
        setSex(selectedOption ? selectedOption.value : '');
    };
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [payed, setPayed] = useState(0);
    const [formation, setFormation] = useState('');
    const [formationTariff, setFormationTariff] = useState(null);
    const [formations, setFormations] = useState([]);
    const { formationId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // État pour le spinner
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        const fetchFormations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/PresentationFormation`);
                setFormations(response.data.results);
                // Si une formation est sélectionnée, on met à jour le tarif
                if (formationId) {
                    const selectedFormation = response.data.results.find(f => f.id === parseInt(formationId));
                    if (selectedFormation) {
                        setFormationTariff(selectedFormation.tariff);
                        setFormation(selectedFormation.id);
                    }
                }
            } catch (error) {
                toast.error("Impossible de récupérer la liste des formations.");
            }
        };

        fetchFormations();
    }, [formationId]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setContact('');
        setSex('');
        setPayed(0);
        setFormation('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Afficher le spinner
    
        try {
            // Si Stripe est configuré pour traiter le paiement
            if (stripe && elements) {
                const cardElement = elements.getElement(CardElement);
                const { paymentMethod, error } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                });
    
                if (error) {
                    toast.error("Erreur de paiement : " + error.message);
                    setLoading(false);
                    return;
                }
    
                // Processus de paiement avec Stripe
                const paymentResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/payment`, {
                    payment_method: paymentMethod.id,
                    amount: payed , // en cents
                });
    
                console.log('Payment Method :', paymentMethod.id);
                console.log('Amount :', payed * 100);
    
                if (paymentResponse.data.success) {
                    // Le paiement a réussi, on continue avec la création de l'utilisateur
                    const userResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
                        name,
                        email,
                        contact,
                        sex,
                        type: 'apprenant',
                    });
    
                    const userId = userResponse.data.user.id;
                    if (!userId) {
                        toast.error("Impossible de récupérer l'ID de l'utilisateur.");
                        setLoading(false);
                        return;
                    }
    
                    // Enregistrement de l'inscription
                    const paymentState = payed === formationTariff ? 'Payée' : (payed > 0 ? 'En cours' : 'Non payée');
                    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/inscriptions`, {
                        user_id: userId,
                        formation_id: formation,
                        payed,
                    type_paiement:'carte bancaire',

                        payment_state:paymentState,
                        inscription_date: new Date().toISOString().split('T')[0],
                    });
                    console.log('formation_id: ',formationId);
    
                    // Affichage du message de succès
                    Swal.fire({
                        title: "Bravo !",
                        text: "Inscription réussie ! Veuillez visiter votre boîte mail pour activer votre compte.",
                        icon: "success"
                    });
                    navigate('/');
                } else {
                    toast.error("Erreur de paiement : " + paymentResponse.data.error);
                }
            }
        } catch (error) {
            Swal.fire({
                title: "Oops ...",
                text: "Une erreur est survenue lors de l'inscription.",
                icon: "error"
            });
        } finally {
            setLoading(false); // Masquer le spinner
        }
    };

    return (
<>
    <ToastContainer />
    <section className="calculator">
        <div className="container">
            <div className="row">
                <div className="col-lg-7">
                    {/* Image section */}
                </div>
                <div className="col-lg-5">
                    <div className="section-heading">
                        <h6>Votre Parcours</h6>
                        <h4>Élaborez votre plan de formation</h4>
                    </div>
                    <div className="alert alert-info">
                        <strong>Paiement en plusieurs fois :</strong> Vous pouvez payer un acompte de 50% maintenant, et le solde restant avant le début de la formation . Veuillez noter que le paiement intégral doit être effectué avant le début, sinon l'accès au cours ne sera pas autorisé.
                    </div>
                    <form onSubmit={handleSubmit} id="calculate">
                        <div className="row">
                            <div className="col-lg-6">
                                <fieldset>
                                    <label htmlFor="name">Votre Nom</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </fieldset>
                            </div>
                            <div className="col-lg-6">
                                <fieldset>
                                    <label htmlFor="contact">Votre Contact</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="contact"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        required
                                    />
                                </fieldset>
                            </div>
                            <div className="col-lg-12">
                                <fieldset>
                                    <label htmlFor="email">Votre Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </fieldset>
                            </div>
                            <div className="col-lg-12">
                                <fieldset>
                                    <label htmlFor="payed">Montant Payé</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="payed"
                                        value={payed}
                                        onChange={(e) => setPayed(parseInt(e.target.value))}
                                        required
                                    />
                                </fieldset>
                            </div>
                            <div className="col-lg-6">
                                <fieldset>
                                    <label htmlFor="formationSelect">Type de formation</label>
                                    <select
                                        className="form-select"
                                        id="formationSelect"
                                        value={formation}
                                        onChange={(e) => {
                                            const selectedFormation = formations.find(
                                                (f) => f.id === parseInt(e.target.value)
                                            );
                                            setFormation(e.target.value);
                                            setFormationTariff(selectedFormation ? selectedFormation.tariff : null);
                                        }}
                                        required
                                    >
                                        <option value="">Choisissez une option</option>
                                        {formations.map((form) => (
                                            <option key={form.id} value={form.id}>
                                                {form.name} ({form.tariff} Ar)
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            </div>

                            <div className="col-lg-6">
                                <fieldset>
                                    <label htmlFor="sexSelect">Sexe</label>
                                    <select
                                        id="sexSelect"
                                        className="form-select"
                                        value={sex}
                                        onChange={(e) => setSex(e.target.value)}
                                        required
                                    >
                                        <option value="">Choisissez un sexe</option>
                                        {options.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            </div>

                            {/* Intégration Stripe Elements */}
                            <div className="col-lg-12 mb-3">
                                <fieldset>
                                    <label htmlFor="card" className="form-label">Numéro de carte bancaire</label>
                                    <div className="input-group card-input-group">
                                        <span className="input-group-text bg-white border-0">
                                            <i className="fas fa-credit-card"></i>
                                        </span>
                                        <div className="form-control p-2" id="card">
                                            <CardElement options={{ hidePostalCode: true }} className="stripe-card-element" />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                            <div className="col-lg-12">
                                <fieldset>
                                    <button type="submit" id="form-submit" className="green-button" disabled={loading}>
                                        {loading ? (
                                            <ClipLoader color="#ffffff" size={20} /> // Spinner ici
                                        ) : (
                                            <> <i className="fas fa-user-plus"></i> Inscrivez-vous maintenant</>
                                        )}
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

const Inscription = () => {
    return (
        <Elements stripe={stripePromise}>
            <Inscription_stripe />
        </Elements>
    );
};

export default Inscription;
