import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import axiosClient from '../../axiosClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PresenceList = () => {
  const { planningId } = useParams();
  const [presenceData, setPresenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [shouldReload, setShouldReload] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [formations, setFormations] = useState([]); // État pour les formations
  const [cours, setCours] = useState([]); // État pour les cours
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!planningId) {
      setError("L'ID du planning n'est pas défini.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axiosClient.get(`/presences/planning/${planningId}`);
        setPresenceData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des données');
        setLoading(false);
      }
    };

    fetchData();
  }, [planningId, shouldReload]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axiosClient.get('/users');
        const profilesMap = response.data.reduce((map, profile) => {
          map[profile.id] = profile;
          return map;
        }, {});
        setProfiles(profilesMap);
      } catch (err) {
        console.error("Erreur lors de la récupération des profils d'utilisateurs", err);
      }
    };

    fetchProfiles();
  }, []);

  // Nouvelle fonction pour récupérer les formations et les cours
  useEffect(() => {
    const fetchFormationsAndCours = async () => {
      try {
        const [formationsResponse, coursResponse] = await Promise.all([
          axiosClient.get('/formations'),
          axiosClient.get('/courses')
        ]);
        setFormations(formationsResponse.data.results);
        setCours(coursResponse.data.results);
      } catch (err) {
        console.error("Erreur lors de la récupération des formations ou des cours", err);
      }
    };

    fetchFormationsAndCours();
  }, []);

  const handleCheckboxChange = (userId, status) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [userId]: status
    }));
  };

  const handleMarquerPresence = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    console.log('Submit');

    try {
      for (const [userId, status] of Object.entries(attendanceStatus)) {
        if (status) {
          await axiosClient.post('/presences/mark', {
            planning_id: planningId,
            user_id: userId,
            status: status
          });
        }
      }
      setShouldReload((prev) => !prev);
      toast.success('Présence marquée avec succès !');
    } catch (error) {
      console.error('Erreur lors du marquage de présence :', error.response?.data);
      toast.error('Erreur lors du marquage de présence.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'présent':
        return 'status-présent';
      case 'absent':
        return 'status-absent';
      case 'Retard':
        return 'status-late';
      default:
        return 'status-default';
    }
  };

  const handleDeletePresence = async (userId) => {
    try {
      console.log('deletePresence clicked');
      // Appel de l'API pour supprimer la présence
      const response = await axiosClient.put(`/presences/${planningId}/${userId}`);
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Mise à jour de l'état local pour refléter la suppression
      // setFilteredPresences(filteredPresences.filter(presence => presence.user_id !== userId));
      setShouldReload((prev) => !prev);
      

    } catch (error) {
      console.error('Erreur lors de la suppression de la présence :', error);
      
      // Afficher un toast d'erreur
      toast.error(error.response?.data?.error || "Une erreur s'est produite.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  

  // Fonction pour gérer la recherche
  const filteredPresences = presenceData?.presences.filter((presence) => {
    const userProfile = profiles[presence.user_id];
    const nameMatches = userProfile?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatches = userProfile?.email.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatches || emailMatches;
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  // Trouver les noms de la formation et du cours à partir des IDs
  const formationName = formations.find(f => f.id === presenceData.planning.formation_id)?.name || 'Formation non trouvée';
  const courseName = cours.find(c => c.id === presenceData.planning.cours_id)?.name || 'Cours non trouvé';

  return (
    <div>
            <ToastContainer />

            {presenceData && (
  <div>
    <div className="row">
      <div className="col-12">
        <div className="card mb-4">
          <div className="card-header pb-0">
            <h6>
              Fiche de Présence pour la Formation {formationName} du cours {courseName} le {presenceData.planning.date} à {presenceData.planning.start_time} jusqu'à {presenceData.planning.end_time}
            </h6>
          </div>

          <div className="header-bar">
            <button
              className="btn btn-primary me-2"
              onClick={handleMarquerPresence} // Remplacer onSubmit par onClick
              disabled={submitting}
            >
              {submitting ? 'Marquage en cours...' : 'Marquer Présence'}
            </button>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Rechercher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          <div className="card-header pb-0">
            <h6>Les apprenants de la Formation {formationName}</h6>
          </div>
          <div className="card-body px-0 pt-0 pb-2">
            <div className="table-responsive p-0">
              {filteredPresences.length > 0 ? (
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nom</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Marquer Présence</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Supprimer Présence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPresences.map((presence) => {
                      const userProfile = profiles[presence.user_id];
                      const isChecked = attendanceStatus[presence.user_id] === 'présent';
                      return (
                        <tr key={presence.user_id}>
                          <td>
                            <div className="d-flex px-2 py-1">
                              <div>
                                <img
                                  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${userProfile.image}` || "../assets/img/default-avatar.jpg"}
                                  className="avatar avatar-sm me-3"
                                  alt={userProfile?.name}
                                />
                              </div>
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-sm">{userProfile?.name}</h6>
                                <p className="text-xs text-secondary mb-0">{userProfile?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={getStatusClass(presence.status)}>
                              {presence.status}
                            </span>
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(presence.user_id, e.target.checked ? 'présent' : 'absent')}
                            />
                          </td>
                          <td className="text-center">
                            {presence.status === 'présent' && (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleDeletePresence(presence.user_id)} // Change this function name as needed
                              >
                                Marquer comme Absent
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>Aucun étudiant inscrit pour cette formation.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}



  <style jsx>{`
        .status-présent {
          background-color: blue !important;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          display: inline-block;
        }
        .status-absent {
          background-color: red !important;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          display: inline-block;
        }
        .status-late {
          background-color: orange !important;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          display: inline-block;
        }
        .status-default {
          background-color: grey !important;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default PresenceList;
