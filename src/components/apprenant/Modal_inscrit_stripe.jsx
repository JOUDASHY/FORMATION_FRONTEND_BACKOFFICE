import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51QKJJnGEhTpV5xSFjWUc9PanYP5pveU1pG1Q5zQ1pCzE9DnktmzOTNu0ypmBX3qtcorKpXaQi6BcJReOJtv95rZa00UMly1kcQ'); // Remplacez ceci par votre clé publique Stripe

const InscriptionModal = ({ confirmModalIsOpen, closeConfirmModal, selectedFormation, refreshInscriptions }) => {
    const [loading, setLoading] = useState(false);
    const stripe = useStripe();
    const elements = useElements();

    const handleConfirmInscription = async () => {
        if (!stripe || !elements) {
            toast.error("Stripe n'est pas encore chargé.");
            return;
        }

        setLoading(true);

        try {
            // Création du PaymentMethod avec Stripe
            const cardElement = elements.getElement(CardElement);
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                toast.error(`Erreur de paiement : ${error.message}`);
                setLoading(false);
                return;
            }

            // Effectuer la demande de paiement vers votre serveur pour traiter le montant de la formation
            const paymentResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/payment`, {
                payment_method: paymentMethod.id,
                amount: selectedFormation.tariff * 100, // Montant en centimes
            });

            if (paymentResponse.data.success) {
                // Paiement réussi, inscription confirmée
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/inscriptions`, {
                    formation_id: selectedFormation.id,
                    payed: selectedFormation.tariff,
                    payment_state: 'Payée',
                    inscription_date: new Date().toISOString().split('T')[0],
                });

                toast.success("Inscription et paiement confirmés avec succès !");
                refreshInscriptions();
                closeConfirmModal();
            } else {
                toast.error("Échec du paiement : " + paymentResponse.data.error);
            }
        } catch (error) {
            toast.error("Erreur lors de la confirmation de paiement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={confirmModalIsOpen}
            onRequestClose={closeConfirmModal}
            overlayClassName="modal-overlay"
            className="customModal"
        >
            <div className="modal-header">
                <h2>Confirmation de paiement</h2>
                <button className="close-btn" onClick={closeConfirmModal}>&times;</button>
            </div>
            <div className="modal-body">
                <p>Êtes-vous sûr de vouloir vous inscrire à la formation <strong>{selectedFormation?.name}</strong> ?</p>
                <p>Montant à payer : <strong>{selectedFormation?.tariff} Ar</strong></p>

                <div className="payment-form">
                    <CardElement className="form-control" />
                </div>
            </div>
            <div className="modal-footer">
                <button className="btn btn-success" onClick={handleConfirmInscription} disabled={loading}>
                    {loading ? "Traitement..." : "Confirmer le paiement"}
                </button>
                <button className="btn btn-secondary" onClick={closeConfirmModal}>
                    Annuler
                </button>
            </div>
        </Modal>
    );
};

const Modal_inscrit_stripe = ({ confirmModalIsOpen, closeConfirmModal, selectedFormation, refreshInscriptions }) => (
    <Elements stripe={stripePromise}>
        <InscriptionModal 
            confirmModalIsOpen={confirmModalIsOpen} 
            closeConfirmModal={closeConfirmModal} 
            selectedFormation={selectedFormation} 
            refreshInscriptions={refreshInscriptions} 
        />
    </Elements>
);

export default Modal_inscrit_stripe;
