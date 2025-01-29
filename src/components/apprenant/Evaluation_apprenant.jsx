import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../axiosClient';

const EvaluationApprenant = () => {
    const { formationId } = useParams();
    const [evaluations, setEvaluations] = useState([]);
    const [moyenne, setMoyenne] = useState('');
    const [username, setUsername] = useState('');
    const [formation, setFormation] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvaluations = async () => {
            try {
                const response = await axiosClient.get(`/evaluations/user/${formationId}`);
                setEvaluations(response.data.evaluations);
                setFormation(response.data.formation); // Récupérer le nom de la formation
                setUsername(response.data.user); // Récupérer le nom de l'utilisateur
                setMoyenne(response.data.moyenne);
                setLoading(false);
            } catch (err) {
                setError('Erreur lors du chargement des évaluations');
                setLoading(false);
            }
        };
    
        fetchEvaluations();
    }, [formationId]);
    

    if (loading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger text-center my-4">{error}</div>;
    }

    return (

        <React.Fragment>

<div className="row">
  <div className="col-12">
    <div className="card mb-4">
      <div className="card-header pb-0">
      <h2>Liste des évaluations de {username} au formation {formation}</h2>

      </div>
   

      <div className="card-body px-0 pt-0 pb-2">
        <div className="table-responsive p-0">
          <table className="table align-items-center mb-0">
            <thead>
              <tr>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">#</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nom du Cours</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Note</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Commentaire</th>
              </tr>
            </thead>

            <tbody>
              {evaluations.length > 0 ? (
                evaluations.map((evaluation, index) => (
                  <tr key={evaluation.id}>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{index + 1}</p>
                    </td>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{evaluation.course.name}</p>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          evaluation.note >= 10 ? 'bg-success' : 'bg-danger'
                        } text-light px-3 py-2`}
                      >
                        {evaluation.note}
                      </span>
                    </td>
                    <td style={{ 
                      maxWidth: "150px", 
                      whiteSpace: "nowrap", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis" 
                    }}>
                      <p className="text-xs font-weight-bold mb-0">
                        {evaluation.commentaire}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Aucune évaluation trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Affichage de la moyenne générale en bas à droite */}
<div 
    className="moyenne-container" 
    style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        fontSize: '1.2rem',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
    }}
>
    Moyenne générale : {moyenne ? moyenne.toFixed(2) : 'Non calculée'} / 20
</div>

    
</React.Fragment>
    );
};

export default EvaluationApprenant;
