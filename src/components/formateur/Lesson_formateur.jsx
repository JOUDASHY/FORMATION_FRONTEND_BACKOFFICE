import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import axiosClient from '../../axiosClient';





// Définir les styles du modal

Modal.setAppElement('#root');

const Lesson_formateur = ({ user }) => {
  const navigate = useNavigate();
  const [addModalIsOpen, setAddModalIsOpen] = useState(false); // Modal pour l'ajout
  const [editModalIsOpen, setEditModalIsOpen] = useState(false); // Modal pour la modification
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false); // Modal de confirmation de suppression
  const [courses, setCourses] = useState([]); // État pour stocker les options des cours
  const [users, setUsers] = useState([]); 



  const [lessons, setLessons] = useState([]); // État pour stocker les cours
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [id, setId] = useState('');
  const [title, setTitle] = useState("");
  const [course_id, setCourse_id] = useState(null);
  const [description, setDescription] = useState("");
  const [user_id, setUser_id] = useState(user.id);
  const [file_path, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [coursesMap, setCoursesMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

 
  // const [lessonToDelete, setLessonToDelete] = useState(null); // Pour stocker la leçon à supprimer
  // const [currentLesson, setCurrentLesson] = useState(null); // État pour la leçon à modifier

  // const openModal = () => setModalIsOpen(true);
  // const closeModal = () => setModalIsOpen(false);


  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await axiosClient.get('/courses_formateur');
        const formattedOptions = response.data.courses.map((course) => ({
          value: course.id,
          label: course.name
        }));
        setOptions(formattedOptions);
        // Remplir le mapping des Courses
        const map = response.data.courses.reduce((acc, course) => {
          acc[course.id] = course.name;
          return acc;
        }, {});
        setCoursesMap(map);
      } catch (error) {
        console.error('Erreur lors de la récupération des Courses:', error);
      }
    }
    fetchCourses();
  }, []);


  const openDeleteModal = (lesson) => {
    setSelectedLesson(lesson);
    setIsDeleteModalOpen(true); 
};

  const handleChange = (selectedOption) => {
    setSelectedCourse(selectedOption);
    setCourse_id(selectedOption.value);
  };

  async function save(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', title);

    formData.append('description', description);
    formData.append('course_id', course_id);

    formData.append('file', file_path);

    try {
      await axiosClient.post("/lessons", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Lecon enregistrée avec succès");
      resetForm();
      setAddModalIsOpen(false);
    } catch (err) {
      toast.error("Échec de l'enregistrement de la Lecon");
    }
  }


  const resetForm = () => {
    setId("");
    setTitle('');
    setFile(null);
    setCourse_id(null);
    setDescription('');

   
    setSelectedCourse(null);
    Load();
    setEditModalIsOpen(false);
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    (async () => await Load())();
  }, []);

  async function Load() {
    const result = await axiosClient.get("/Lesson_formateur");
    setLessons(result.data.results);
  }


  const openAddModal = () => {
    resetForm(); // Réinitialiser le formulaire avant d'ouvrir le modal d'ajout
    setAddModalIsOpen(true);
  };

  const openEditModal = (lesson) => {
    setSelectedLesson(lesson);
    setEditModalIsOpen(true);
    editLesson(lesson);
  };

  const handleEditClick = (lesson) => {
    setSelectedLesson(lesson);
    setEditModalIsOpen(true);
    editLesson(lesson);
  };

  async function editLesson(lesson) {
    setTitle(lesson.title);


    setCourse_id(lesson.course_id);
    setDescription(lesson.description);
    setId(lesson.id);
    setFile(null); // On ne garde pas l'ancienne image, car on veut une nouvelle sélection
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 500 * 1024 * 1024) {
      alert("La taille du fichier ne doit pas dépasser 500 Mo.");
      return;
    }
    setFile(file);
  };
  

  async function update(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('title', title);


    formData.append('course_id', course_id);
    formData.append('description', description);
    formData.append('file', file_path);

    try {
      await axiosClient.post("/updatelesson/" + id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      resetForm();
      toast.success('lesson mise à jour');
    } catch (err) {
      toast.success('Échec de la mise à jour de la lesson');
    }
  }


  async function DeleteLesson(id) {
    await axiosClient.delete("/lessons/" + id);
    resetForm();
    toast.success('lessons supprimée avec succès');
  }

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="row">
          <ToastContainer /> 

          <div className="card-header pb-0">
      <h2>Mes Leçons</h2>

      </div>

      <div className="header-bar">
        {/* Bouton d'ajout de certification */}
        <button className="btn-create" onClick={openAddModal}>
          <i className="fas fa-plus-circle me-4"></i> Nouveau cours
        </button>

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

      <div className="row mt-3">
  {/* Contenu principal */}
  <div className="col-lg-9 mb-lg-0 mb-0">
    {/* Liste des leçons sous forme de cartes */}
    <div className="row">
      {filteredLessons.map((lesson) => (
        <div className="col-12 mb-3" key={lesson.id}>
          <div className="card h-100 shadow-sm" style={{ border: '1px solid rgba(0, 0, 0, 0.125)' }}>
            <div className="card-body">
              <h3 className="card-title">{lesson.title}</h3>
              <p className="card-text">{lesson.description}</p>
              {lesson.file_path && (
                <div className="media mb-0" style={{ position: 'relative' }}>
                  {/* Vérification pour les types de fichiers */}
                  {lesson.file_path.endsWith('.pdf') ? (
                    <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary">
                      Voir le PDF
                    </a>
                  ) : lesson.file_path.endsWith('.mp4') || lesson.file_path.endsWith('.avi') ? (
                    <video className="media-content" controls>
                      <source src={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`} type="video/mp4" />
                      Votre navigateur ne supporte pas la vidéo.
                    </video>
                  ) : lesson.file_path.endsWith('.docx') || lesson.file_path.endsWith('.odt') || lesson.file_path.endsWith('.rar') || lesson.file_path.endsWith('.zip') ? (
                    <div className="file-info">
                      <span>Fichier {lesson.file_path.split('.').pop().toUpperCase()}</span>
                      <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary">
                        Télécharger {lesson.file_path.split('.').pop().toUpperCase()}
                      </a>
                    </div>
                  ) : lesson.file_path.endsWith('.iso') ? (
                    <div className="file-info">
                      <span>Fichier ISO file</span>
                      <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary">
                        Télécharger l'ISO
                      </a>
                    </div>
                  ) : (
                    <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`} alt={lesson.title} className="media-content" style={{ maxWidth: '100%', height: 'auto' }} />
                  )}
                  <div className="mt-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                        <strong>Matière : </strong>{lesson.courses.name}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <div className="d-flex justify-content-start"></div>
                      <div className="d-flex justify-content-end align-items-center">
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL}/storage/${lesson.file_path}`}
                          download
                          className="btn btn-primary me-2"
                          title="Télécharger le fichier"
                          style={{
                            backgroundColor: '#007bff',
                            borderColor: '#007bff',
                            transition: 'background-color 0.3s, border-color 0.3s',
                            fontSize: '1rem',
                            padding: '10px 15px',
                          }}
                        >
                          <i className="fas fa-download me-2" style={{ fontSize: '1rem' }}></i>
                        </a>
                        <button
                          onClick={() => handleEditClick(lesson)}
                          className="btn btn-primary me-2"
                          style={{
                            fontSize: '1rem',
                            border: '1px solid #ccc',
                            padding: '10px 15px',
                          }}
                        >
                          <i className="fas fa-edit" style={{ color: 'black', fontSize: '1rem' }}></i>
                        </button>
                        <button
                          onClick={() => openDeleteModal(lesson)}
                          className="btn btn-danger"
                          style={{
                            fontSize: '1rem',
                            border: '1px solid #ccc',
                            padding: '10px 15px',
                          }}
                        >
                          <i className="fas fa-trash" style={{ color: 'black', fontSize: '1rem' }}></i>
                        </button>
                      </div>
                    </div>
                    <style jsx>{`
                      @media (max-width: 576px) {
                        .btn {
                          font-size: 0.9rem !important;
                          padding: 8px 12px;
                        }
                        .btn i {
                          font-size: 1rem !important;
                        }
                      }
                    `}</style>
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






{/* Modal pour ajouter un module */}
<Modal
  overlayClassName="modal-overlay"
  className="customModal"
  isOpen={addModalIsOpen}
  onRequestClose={() => setAddModalIsOpen(false)}
>
  <div className="modal-header">
    <h4 className="modal-title">Ajouter une leçon</h4>
 
  </div>

  <div className="modal-body">
    <form onSubmit={save}>
      <div className="form-group">
        <label htmlFor="lessonName">Titre de la leçon</label>
        <input 
          type="text" 
          id="lessonName" 
          className="form-control" 
          placeholder="Nom de la leçon" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input 
          type="text" 
          id="description" 
          className="form-control" 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="course">Matière</label>
        <Select
          value={options.find(option => option.value === course_id)}
          onChange={handleChange}
          options={options}
          placeholder="Choisir une matière"
          className="customSelect"
          classNamePrefix="custom-select"
        />
      </div>

      <label htmlFor="fileInput">Fichier de leçon</label>
      {file_path ? (
        <div className="form-group d-flex align-items-center justify-content-center">
          <label htmlFor="fileInput" className="file-input-label image-selected">
            <img 
              src={file_path instanceof File ? URL.createObjectURL(file_path) : `${import.meta.env.VITE_API_BASE_URL}/storage/${file_path}`} 
              alt="Aperçu de l'image" 
              className="image-preview"
            />
            <input 
              type="file" 
              id="fileInput" 
              className="form-control-file" 
              onChange={(e) => setFile(e.target.files[0])} 
            />
          </label>
        </div>
      ) : (
        <div className="form-group d-flex align-items-center justify-content-center">
          <label htmlFor="fileInput" className="file-input-label">
            <span className="icon">+</span>
            <small>Image, Vidéo, PDF (max 500 Mo)</small>
            <input 
              type="file" 
              id="fileInput" 
              className="form-control-file" 
              onChange={(e) => setFile(e.target.files[0])} 
            />
          </label>
        </div>
      )}
      <div className="form-text text-muted">
        <small>Formats autorisés : Image, Vidéo, PDF. Taille maximale : 500 Mo.</small>
      </div>

      <div className="modal-footer">
        <button type="submit" className="btn btn-primary">
          <i className="fas fa-plus"></i> Ajouter
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => setAddModalIsOpen(false)}>
          <i className="fas fa-times"></i> Annuler
        </button>
      </div>
    </form>
  </div>
</Modal>



{/* Modal pour modifier un module */}
<Modal
  overlayClassName="modal-overlay"
  className="customModal"
  isOpen={editModalIsOpen}
  onRequestClose={() => setEditModalIsOpen(false)}
>
  <div className="modal-header">
    <h4 className="modal-title">Modifier la leçon</h4>
  </div>

  <div className="modal-body">
    <form onSubmit={update}>
      <div className="form-group">
        <label htmlFor="lessonName">Nom de la leçon</label>
        <input 
          type="text" 
          id="lessonName" 
          className="form-control" 
          placeholder="Nom de la leçon" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input 
          type="text" 
          id="description" 
          className="form-control" 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="course">Matière</label>
        <Select
          value={options.find(option => option.value === course_id)}
          onChange={handleChange}
          options={options}
          placeholder="Choisir une matière"
          className="customSelect"
          classNamePrefix="custom-select"
        />
      </div>

      {file_path && (
        <div className="text-center mb-3 d-flex align-items-center">
          <img 
            src={file_path instanceof File ? URL.createObjectURL(file_path) : `${import.meta.env.VITE_API_BASE_URL}/storage/${file_path}`} 
            alt="Aperçu de l'image" 
            className="fixed-image mr-2" 
          />
          <span className="image-text">Fichier sélectionné</span>
        </div>
      )}

      <div className="form-group d-flex align-items-center">
        <label htmlFor="fileInput" className="file-input-label mr-2">
          <input 
            type="file" 
            id="fileInput" 
            className="form-control-file" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
          <span>Parcourir</span>
        </label>
        {file_path && <span className="ml-2 file-name">{file_path.name}</span>}
      </div>

      <div className="form-text text-muted">
        <small>Formats autorisés : Image, Vidéo, PDF. Taille maximale : 500 Mo.</small>
      </div>

      <div className="modal-footer">
        <button type="submit" className="btn btn-warning">
          <i className="fas fa-edit"></i> Modifier
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => resetForm()}>
          <i className="fas fa-times"></i> Annuler
        </button>
      </div>
    </form>
  </div>
</Modal>


  {/* Modal pour la suppression */}
  <Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isDeleteModalOpen} 
    onRequestClose={() => setIsDeleteModalOpen(false)}
>
    <div className="modal-body text-center">
        <p>Voulez-vous supprimer le lesson {selectedLesson?.title} ?</p>
        <div className="modal-footer justify-content-center">
            <button className='btn btn-danger' onClick={() => DeleteLesson(selectedLesson?.id)}>
                <i className="fas fa-trash"></i> Supprimer
            </button>
            <button className='btn btn-secondary' onClick={() => resetForm()}>
                <i className="fas fa-times"></i> Annuler
            </button>
        </div>
    </div>
</Modal>






    </div>
  );
};

export default Lesson_formateur;
