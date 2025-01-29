import React, { useEffect, useState } from 'react';
import axiosClient from '../../axiosClient';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const EvaluationList = () => {
  const { formation_id } = useParams();
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errors, setErrors] = useState({});
  // const [selectedCourseId, setSelectedCourseId] = useState('');
  const [formationName, setFormationName] = useState('');
//  const { formationId } = useParams(); 
 const { formation_id: formationId } = useParams();
 const handleDeleteComment = async (evaluationId) => {
  console.log('evaluationId :', evaluationId);
  if (!evaluationId) {
    console.error("Impossible de supprimer : ID d'évaluation introuvable.");
    toast.error("Erreur : ID d'évaluation introuvable !");
    return;
  }

  try {
    const response = await axiosClient.delete(`/evaluations/${evaluationId}`);
    console.log(response.data.message); // Log facultatif pour vérifier la réponse

    // Mettre à jour la liste des évaluations après suppression
    setEvaluations((prevEvaluations) =>
      prevEvaluations.filter((evaluation) => evaluation.id !== evaluationId)
    );

    // Afficher la notification de succès
    toast.success("Évaluation supprimée avec succès !");
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    toast.error("Erreur lors de la suppression. Veuillez réessayer !");
  }
};

  // Récupérer le nom de la formation correspondant à formation_id
  useEffect(() => {
console.log("Formation ID depuis URL :", formationId);

    if (!formationId) {
      console.log("Formation ID non fourni");
      setFormationName("Formation introuvable");
      return;
    }
  
    axiosClient
      .get("/formations")
      .then((response) => {
        console.log("Données API :", response.data.results);
        const formations = response.data.results || []; // Adaptez si nécessaire
        const formation = formations.find(
          (f) => String(f.id) === String(formationId)
        );

        if (formation) {
          setFormationName(formation.name);
          setSelectedCourseId('');
        } else {
          setFormationName("Formation introuvable");
        }
      })
      
      .catch((error) => {
        console.error("Erreur API :", error);
        setFormationName("Erreur lors de la récupération de la formation");
      });
  }, [formationId]);
  
  
  useEffect(() => {
    const fetchCourses = async () => {
      
      try {
        const response = await axiosClient.get(`/coursesByFormation_formateur/${formation_id}`);
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Unable to load courses. Please try again later.");
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axiosClient.get(`/formations/${formation_id}/users`);
        setStudents(response.data.users);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Unable to load students. Please try again later.");
      }
    };

    const fetchEvaluations = async (courseId) => {
      try {
        const response = await axiosClient.get(`/evaluations/${formation_id}/${courseId}`);
        setEvaluations(response.data); // Assuming the API returns the evaluations for the course and formation
      } catch (error) {
        console.error("Error fetching evaluations:", error);
        setError("Unable to load evaluations. Please try again later.");
      }
    };

    if (formation_id) {
      fetchCourses();
      fetchStudents();
    }

    // Fetch evaluations if a course is selected
    if (selectedCourseId) {
      fetchEvaluations(selectedCourseId);
    }


  }, [formation_id, selectedCourseId]);

  const handleNoteChange = (courseId, userId, value) => {
    const note = parseFloat(value);
  
    // Validation de la note
    if (note < 0 || note > 20 || isNaN(note)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [userId]: "La note doit être comprise entre 0 et 20.",
      }));
      return; // Ne met pas à jour les évaluations si la note est invalide
    } else {
      // Supprimer l'erreur pour cet étudiant si la note est valide
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[userId];
        return newErrors;
      });
    }
  
    // Mettre à jour les évaluations si la note est valide
    setEvaluations((prevEvaluations) => {
      const updatedEvaluations = [...prevEvaluations];
      const evaluationIndex = updatedEvaluations.findIndex(
        (evaluation) => evaluation.course_id === courseId && evaluation.user_id === userId
      );
  
      if (evaluationIndex !== -1) {
        updatedEvaluations[evaluationIndex] = {
          ...updatedEvaluations[evaluationIndex],
          note: value,
        };
      } else {
        updatedEvaluations.push({
          course_id: courseId,
          user_id: userId,
          note: value,
          commentaire: "",
        });
      }
      return updatedEvaluations;
    });
  };
  

  const handleCommentChange = (courseId, userId, value) => {
    setEvaluations((prevEvaluations) => {
      const updatedEvaluations = [...prevEvaluations];
      const evaluationIndex = updatedEvaluations.findIndex(
        (evaluation) => evaluation.course_id === courseId && evaluation.user_id === userId
      );

      if (evaluationIndex !== -1) {
        updatedEvaluations[evaluationIndex] = {
          ...updatedEvaluations[evaluationIndex],
          commentaire: value,
        };
      } else {
        updatedEvaluations.push({
          course_id: courseId,
          user_id: userId,
          note: "",
          commentaire: value,
        });
      }
      return updatedEvaluations;
    });
  };

  const handleSaveAll = async () => {
    try {
      setIsSubmitting(true);
  
      const evaluationsToSave = evaluations.filter(
        (evaluation) => evaluation.course_id === selectedCourseId && evaluation.note !== null
      );
  
      console.log('formationId', formationId);
      console.log('formation_id', formation_id);
  
      await Promise.all(
        evaluationsToSave.map((evaluation) =>
          axiosClient.post('/evaluations', {
            user_id: evaluation.user_id,
            course_id: selectedCourseId,
            formation_id,
            note: evaluation.note,
            commentaire: evaluation.commentaire || '',
          })
        )
      );
  
      // Notification de succès
      toast.success("Toutes les évaluations ont été enregistrées avec succès !");
    } catch (error) {
      console.error("Error saving evaluations:", error);
  
      // Notification d'erreur
      toast.error(
        "Une erreur s'est produite lors de l'enregistrement des évaluations. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }};
  // If there's an error, show the error message
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <React.Fragment>
<div className="my-5" style={{ width: '100%' }}>
<ToastContainer />
    
      <div
        className="card shadow-lg"
        style={{ backgroundColor: '#fff', borderColor: 'var(--blue)' }}
      >
        
        {/* En-tête de la carte */}
        <div
          className="card-header d-flex align-items-center justify-content-between"
          style={{ backgroundColor: 'var(--blue)', color: '#fff' }}
        >
          <p className="mb-0">Évaluations des Cours</p>
          <div className="d-flex align-items-center">
            <label htmlFor="courseSelect" className="form-label mr-2">
              Sélectionnez un cours :
            </label>
            <select
              id="courseSelect"
              className="form-select"
              onChange={(e) => setSelectedCourseId(e.target.value)}
              value={selectedCourseId || ''}
              style={{ borderColor: 'var(--blue)' }}
            >
              <option value="" disabled>
                Sélectionnez un cours
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contenu de la carte */}
        <div className="card-body">
          {/* Message de succès */}
          {successMessage && (
            <div className="alert" style={{ backgroundColor: '#2bb99a', color: '#fff' }}>
              {successMessage}
            </div>
          )}

          {/* Titre principal */}
          <h3 className="mb-4">
            {formationName ? `Évaluations pour la formation : ${formationName}` : 'Veuillez sélectionner une formation'}
          </h3>

          {selectedCourseId ? (
            <div>
              {/* Liste des étudiants */}
              <h4 className="mb-3">Étudiants inscrits :</h4>
              {students.length === 0 ? (
  <p className="text-muted">Aucun étudiant n'est inscrit à cette formation.</p>
) : (
  <div className="list-group">
    {students.map((student) => (
      <div
        key={student.id}
        className="list-group-item mb-3 p-3 border rounded shadow-sm"
        style={{ borderColor: 'var(--blue)' }}
      >
        <div className="row align-items-center">
          {/* Nom de l'étudiant */}
          <div className="col-md-4">
            <h5 className="mb-0" style={{ color: 'var(--blue)' }}>
              {student.name}
            </h5>
          </div>

          {/* Champ pour la note */}
          <div className="col-md-3">
            <label className="form-label d-block">Note (/20) :</label>
 

<input
  type="number"
  className="form-control"
  placeholder="Entrez la note"
  value={
    evaluations.find((evaluation) => evaluation.user_id === student.id)?.note ||
    ''
  }
  min="0"
  max="20"
  step="0.01"  // Permet les valeurs décimales avec deux chiffres après la virgule
  onChange={(e) =>
    handleNoteChange(selectedCourseId, student.id, e.target.value)
  }
  style={{ borderColor: 'var(--blue)' }}
/>

            {errors[student.id] && (
              <small className="text-danger mt-1">{errors[student.id]}</small>
            )}
          </div>

          {/* Champ pour le commentaire */}
          <div className="col-md-5">
            <label className="form-label d-block">Commentaire :</label>
            <div className="d-flex align-items-center">
              <textarea
                className="form-control"
                placeholder="Ajoutez un commentaire"
                value={
                  evaluations.find(
                    (evaluation) => evaluation.user_id === student.id
                  )?.commentaire || ''
                }
                rows="1"
                onChange={(e) =>
                  handleCommentChange(selectedCourseId, student.id, e.target.value)
                }
                style={{ borderColor: 'var(--blue)' }}
              />
              {/* Bouton Supprimer */}
              <button
                className="btn btn-danger ms-2 mt-3"
                onClick={() => handleDeleteComment(evaluations.find((evaluation) => evaluation.user_id === student.id)?.id)}
                title="Supprimer le commentaire"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)}


              {/* Bouton d'enregistrement */}
              <div className="text-center">
                <button
                  onClick={handleSaveAll}
                  disabled={isSubmitting}
                  className="btn mt-4"
                  style={{
                    backgroundColor: 'var(--blue)',
                    color: '#fff',
                    borderColor: '#2bb99a',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2"></span> Enregistrement...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i> Enregistrer toutes les évaluations
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-muted">Veuillez sélectionner un cours pour ajouter des évaluations.</p>
          )}
        </div>
      </div>
    </div>

    </React.Fragment>

  );
};

export default EvaluationList;
