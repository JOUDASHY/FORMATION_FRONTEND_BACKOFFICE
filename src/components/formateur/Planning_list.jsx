import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../axiosClient';

const Planning = () => {
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        const response = await axiosClient.get('/Planning_formateur');
        setPlannings(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchPlannings();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="row">
      <div className="col-12">
        <div className="card mb-4">
          <div className="card-header pb-0">
          <h6>Liste des fiches de présence</h6>

          </div>
          <div className="card-body px-0 pt-0 pb-2">
            <div className="table-responsive p-0">
              <table className="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nom du Cours</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Formation</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Date</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Heure</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Salle</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plannings.map((planning) => (
                    <tr key={planning.id}>
                      <td>
                        <p className="text-xs font-weight-bold mb-0">{planning.courses.name}</p>
                      </td>
                      <td>
                        <p className="text-xs font-weight-bold mb-0">{planning.formations.name}</p>
                      </td>
                      <td>
                        <span className="text-secondary text-xs font-weight-bold">{planning.date}</span>
                      </td>
                      <td>
                        <span className="text-secondary text-xs font-weight-bold">{planning.start_time} à {planning.end_time}</span>
                      </td>
                      <td>
                        <span className="text-secondary text-xs font-weight-bold">{planning.rooms.room_number}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/Presence_list/${planning.id}`)}
                        >
                          Voir la Fiche de Présence
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;
