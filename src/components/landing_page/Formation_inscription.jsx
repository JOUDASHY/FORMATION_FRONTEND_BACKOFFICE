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

const Formation_inscription = () => {
    const [sex, setSex] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [payed, setPayed] = useState(0);
    const [formationTariff, setFormationTariff] = useState(null);
    const [formationName, setFormationName] = useState(null);
    const [formationStart_date, setFormationStart_date] = useState(null);
    const { formationId } = useParams();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false); // État pour le spinner

    useEffect(() => {
        const fetchFormation = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/formations/${formationId}`);
                setFormationTariff(response.data.formation.tariff);
                setFormationName(response.data.formation.name);
                setFormationStart_date(response.data.formation.start_date);
            } catch (error) {
                toast.error("Impossible de récupérer le tarif de la formation.");
            }
        };
        fetchFormation();
    }, [formationId]);

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
                    amount: payed, // en cents
                });
    
                console.log('Payment Method :', paymentMethod.id);
                console.log('Amount :', payed );
    
                if (paymentResponse.data.success) {

                    
                    
                    //    const fullcontact = `+261 ${contact}`;
                    
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
                        formation_id: formationId,
                        payed,
                        type_paiement:'carte bancaire',

                        payment_state: paymentState,
                        inscription_date: new Date().toISOString().split('T')[0],
                    });
    
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
           
    <div className="container mt-5">
        <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
                <div className="section-heading mb-4">
                    <h6 className="text-primary">Inscrivez-vous</h6>
                    <h4 className="fw-bold">Remplissez le formulaire ci-dessous</h4>
                    <p className="text-muted">
  Renseignez les informations pour finaliser votre inscription à la formation <span className="text-primary">{formationName}</span>, qui débute le {formationStart_date}. Les frais de formation s'élèvent à <span className="text-primary">{formationTariff} Ar</span>.
</p>
                </div>
            </div>
        </div>
        
        <div className="row justify-content-center">
            <div className="col-lg-8">
                <form onSubmit={handleSubmit} className="p-4 rounded shadow" style={{ backgroundColor: "#ffffff" }}>
                    <div className="row">
                        <div className="col-lg-6 mb-4">
                            <div className="input-group input-group-lg">
                                <span className="input-group-text bg-primary text-white"><i className="fas fa-user"></i></span>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="Votre Nom"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required/>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-4">
    <div className="input-group input-group-lg">
        <span className="input-group-text bg-primary text-white">
            <i className="fas fa-venus-mars"></i>
        </span>
        <div className="form-control">
            <div className="form-check form-check-inline">
                <input
                    className="form-check-input"
                    type="radio"
                    name="sex"
                    id="masculin"
                    value="masculin"
                    checked={sex === 'masculin'}
                    onChange={(e) => setSex(e.target.value)}
                    required
                />
                <label className="form-check-label" htmlFor="masculin">
                    <i className="fas fa-male me-2"></i>Masculin
                </label>
            </div>
            <div className="form-check form-check-inline">
                <input
                    className="form-check-input"
                    type="radio"
                    name="sex"
                    id="feminin"
                    value="feminin"
                    checked={sex === 'feminin'}
                    onChange={(e) => setSex(e.target.value)}
                    required
                />
                <label className="form-check-label" htmlFor="feminin">
                    <i className="fas fa-female me-2"></i>Féminin
                </label>
            </div>
        </div>
    </div>
</div>
<div className="col-lg-12 mb-4 ">
                            <div className="input-group input-group-lg">
                                <span className="input-group-text bg-primary text-white"><i className="fas fa-envelope"></i></span>
                                <input
                                    type="email"
                                    className="form-control form-control-lg"
                                    placeholder="Votre E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required/>
                            </div>
                        </div>  
                        <div className="col-lg-12 mb-4">
                            <div className="input-group input-group-lg">
                                <span className="input-group-text bg-primary text-white"><i className="fas fa-phone-alt"></i> <span className="country-code me-2" style={{ fontSize: "1rem", lineHeight: "1.5" }}>
        +261
    </span></span>
                                <input
                                    type="tel"
                                    className="form-control form-control-lg"
                                    placeholder="Ex : 348 655 523"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    pattern="^[0-9]{9}$"   // Limite à 9 chiffres
                                    maxLength="9"    />
                            </div>
                        </div>
                        <div className="col-lg-12 mb-4">
    <div className="input-group input-group-lg">
        <span className="input-group-text bg-primary text-white">
            <i className="fas fa-money-bill-wave"></i>
        </span>
        <div className="form-control">
            <div className="form-check form-check-inline">
                <input
                    className="form-check-input"
                    type="radio"
                    name="payedOption"
                    id="fiftyPercent"
                    value={formationTariff * 0.5}
                    checked={payed === formationTariff * 0.5}
                    onChange={(e) => setPayed(parseInt(e.target.value))}
                    required
                />
                <label className="form-check-label" htmlFor="fiftyPercent">
                    <i className="fas fa-coins me-3"></i>50% ({formationTariff * 0.5} Ar)
                </label>
            </div>
            <div className="form-check form-check-inline ">
                <input
                    className="form-check-input"
                    type="radio"
                    name="payedOption"
                    id="fullPayment"
                    value={formationTariff}
                    checked={payed === formationTariff}
                    onChange={(e) => setPayed(parseInt(e.target.value))}
                    required
                />
                <label className="form-check-label" htmlFor="fullPayment">
                    <i className="fas fa-wallet me-3"></i>100% ({formationTariff} Ar)
                </label>
            </div>
        </div>
    </div>
</div>



                   
                        {/* Section d'information sur le paiement par tranche */}
                        <div className="col-lg-12 mb-4 text-center">
                        <div className="alerte alerte-info">
    <strong>Options de paiement :</strong> 
    Vous pouvez payer un acompte de <span className="text-primary">50%</span> 
    ({formationTariff * 0.5} Ar) maintenant ou régler l'intégralité 
    (<span className="text-primary">100%</span> : {formationTariff} Ar). 
    Le paiement total doit être effectué avant le début de la formation ({formationStart_date}).
</div>

</div>



                        <div className="col-lg-12 mb-4">
                        <fieldset>
        <div className="input-group card-input-group">
        <span className="input-group-text bg-primary text-white">
                <i className="fas fa-credit-card"></i>
            </span>
            <div className="form-control p-2" id="card">
                <CardElement options={{ hidePostalCode: true }} className="stripe-card-element" />
            </div>
        </div>
    </fieldset>
                        </div>

                        
                        <div className="col-lg-12 text-center">
                            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                                {loading ? (
                                    <ClipLoader color="#ffffff" size={20} /> 
                                ) : (
                                    <>
                                        <i className="fas fa-user-plus me-2"></i> S'inscrire
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>



        </>
    );
};

// Enveloppez Formation_inscription dans le composant Elements
const FormationInscriptionWithStripe = () => (
    <Elements stripe={stripePromise}>
        <Formation_inscription />
    </Elements>
);

export default FormationInscriptionWithStripe;
