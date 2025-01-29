import React, { useEffect, useState } from 'react';
import axiosClient from '../../axiosClient';

const Payment_history = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les paiements
  const fetchPayments = async () => {
    try {
      const response = await axiosClient.get('/paiements');
      setPayments(response.data.results);
      setLoading(false);
    } catch (err) {
      setError("Une erreur s'est produite lors de la récupération des données.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) return <p>Chargement des paiements...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container-fluid my-0">
      <div className="card shadow-lg border-light">
        <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
          <h3 className="text-white">Historique des paiements</h3>
        </div>
        <div className="card-body">
          {payments.length > 0 ? (
            <ul className="list-group list-group-flush">
              {payments.map(payment => {
                // Si l'utilisateur est un admin, on affiche tous les paiements
                // Si l'utilisateur est un apprenant, on affiche seulement les paiements qui lui sont associés
                if (user.type === 'admin' || payment.inscriptions?.user_id === user.id) {
                  return (
                    <li
                      key={payment.id}
                      className="list-group-item d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div>
                        <p className="text-muted fs-7">
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${payment.inscriptions?.users?.image}`}
                            className="avatar avatar-sm me-4 fixed-image"
                            alt="Utilisateur"
                          />
                          {`${payment.montant} Ar ont été payés le ${new Date(payment.date_paiement).toLocaleString()} par `}
                          <span className="text-dark fw-bold fs-7">
                            {payment.inscriptions?.users?.name || 'un utilisateur inconnu'}
                          </span>
                          {` pour la formation `}
                          <span className="fw-semibold text-success fs-7">
                            {payment.inscriptions?.formations?.name || 'Inconnue'}
                          </span>.
                        </p>
                        {/* Ajout du type de paiement */}
                        <p className="fs-7 text-muted">
                          <span className="fw-bold">Type de paiement :</span> {payment.type_paiement || 'Non spécifié'}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          payment.inscriptions?.payment_state === 'payée'
                            ? 'bg-success'
                            : 'bg-danger'
                        } px-3 py-2`}
                      >
                        {payment.inscriptions?.payment_state || 'Non spécifié'}
                      </span>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          ) : (
            <div className="text-center py-5">
              <h5 className="text-muted">Aucun paiement enregistré</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment_history;
