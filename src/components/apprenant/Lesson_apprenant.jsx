import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import axiosClient from '../../axiosClient';

Modal.setAppElement('#root');

const Lesson_apprenant = ({ user }) => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false); // Modal pour la modification
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false); // Modal de confirmation de suppression
  const [courses, setCourses] = useState([]); // État pour stocker les options des cours
  const [lessons, setLessons] = useState([]); // État pour stocker les cours
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      await loadCourses();
      await loadLessons();
    })();
  }, []);

  // Fonction pour charger les cours
  async function loadCourses() {
    const result = await axiosClient.get("/courses");
    setCourses(result.data.results); // Stocke tous les cours
  }

  // Fonction pour charger les leçons
  async function loadLessons() {
    const result = await axiosClient.get("/Lesson_apprenant");
    setLessons(result.data.results);
  }

  // Fonction pour obtenir le nom de l'utilisateur associé au cours
  const getInstructorName = (courseId) => {
    const course = courses.find(course => course.id === courseId);
    return course ? course.user.name : 'Inconnu';
  };

  // Filtrer les leçons en fonction de la recherche
  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="row">
      <ToastContainer />
      <div className="card">
        <div className="card-header pb-0">
          <h2>Les leçons disponibles pour les formations</h2>
        </div>

        <div className="header-bar">
          {/* Barre de recherche */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher une leçon..."
              aria-label="Rechercher une leçon"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-lg-9 mb-lg-0 mb-4">
          {/* Liste des leçons sous forme de cartes */}
          <div className="row">
            {filteredLessons.map((lesson) => (
              <div className="col-12 mb-4" key={lesson.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title">{lesson.title}</h3>
                    <p className="card-text">{lesson.description}</p>
                    {lesson.file_path && (
                      <div className="media mb-3" style={{ position: 'relative' }}>
                        {lesson.file_path.endsWith('.pdf') ? (
                          <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary">
                            Voir le PDF
                          </a>
                        ) : lesson.file_path.endsWith('.mp4') || lesson.file_path.endsWith('.avi') ? (
                          <video className="media-content" controls>
                            <source src={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`} type="video/mp4" />
                            Votre navigateur ne supporte pas la vidéo.
                          </video>
                        ) : (
                          <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`} alt={lesson.title} className="media-content" />
                        )}

                        <div className="mt-3 d-flex justify-content-between align-items-center">
                          <div>
                            <a
                              href={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`}
                              download
                              className="btn btn-primary me-2"
                              title="Télécharger le fichier"
                            >
                              <i className="fas fa-download me-2"></i>                         
                            </a>

                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                              <strong>Publier par : </strong>{getInstructorName(lesson.course_id)}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                              <strong>Matière : </strong>{lesson.courses?.name || 'Inconnu'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar pour les leçons récentes */}
        <div className="col-lg-3">
          <div className="card h-100">
            <div className="card-header pb-0 px-3">
              <h6 className="mb-0">Leçons Récentes</h6>
            </div>
            <div className="card-body pt-4 p-3">
              <h6 className="text-uppercase text-body text-xs font-weight-bolder mb-3">Dernières leçons</h6>
              <ul className="list-group">
                {lessons.slice(0, 5).map((lesson) => (
                  <li key={lesson.id} className="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                    <div className="d-flex flex-column">
                      <h6 className="mb-1 text-dark text-sm">{lesson.title}</h6>
                      <span className="text-xs">{new Date(lesson.created_at).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Lesson_apprenant;
