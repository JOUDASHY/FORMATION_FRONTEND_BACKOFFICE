import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Select from 'react-select';
import axiosClient from '../../axiosClient';

Modal.setAppElement('#root');

function course() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [id, setId] = useState('');
  const [name, setName] = useState("");
  const [module_id, setmodule_id] = useState(null);
  const [description, setDescription] = useState("");
  const [user_id, setUser_id] = useState("");
  const [duration, setDuration] = useState("");
  const [fileimage, setPhoto] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [options, setOptions] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [modulesMap, setmodulesMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [usersMap, setUsersMap] = useState({});
  const [usersOptions, setUsersOptions] = useState([]);


  
  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await axiosClient.get('/modules');
        const formattedOptions = response.data.results.map((module) => ({
          value: module.id,
          label: module.name
        }));
        setOptions(formattedOptions);
        // Remplir le mapping des modules
        const map = response.data.results.reduce((acc, module) => {
          acc[module.id] = module.name;
          return acc;
        }, {});
        setmodulesMap(map);
      } catch (error) {
        console.error('Erreur lors de la récupération des modules:', error);
      }
    }
    fetchModules();
  }, []);



  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axiosClient.get('/users');
        const formattedUserOptions = response.data
          .filter(user => user.type === 'formateur')  // Filtrer les utilisateurs de type 'apprenant'
          .map((user) => ({
            value: user.id,  // Utiliser l'id pour la valeur
            label: user.name // Utiliser le name pour l'étiquette
          }));
          
        setUsersOptions(formattedUserOptions);  // Mettre à jour l'état avec les utilisateurs filtrés
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    }
  
    fetchUsers();
  }, []);
  



  const handleChange = (selectedOption) => {
    setSelectedModule(selectedOption);
    setmodule_id(selectedOption.value);
  };

  async function save(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (duration) formData.append('duration', duration);
    // formData.append('duration', duration);
    if (description) formData.append('description', description);
    formData.append('module_id', module_id);
    if (user_id) formData.append('user_id', user_id);
    formData.append('image', fileimage);

    try {
      await axiosClient.post("/courses", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("course enregistrée avec succès");
      resetForm();
    } catch (err) {
      toast.error("Échec de l'enregistrement de la course");
    }
  }


  const resetForm = () => {
    setId("");
    setName('');
    setDuration('');
    setmodule_id(null);
    setDescription('');
    setUser_id('');
    setPhoto(null);
    setSelectedCourse(null);
    Load();
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    (async () => await Load())();
  }, []);


  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axiosClient.get('/users');
        const users = response.data;
        // Créer une map de user_id vers user name
        const usersMap = {};
        users.forEach((user) => {
          usersMap[user.id] = user.name;
        });
  
        setUsersMap(usersMap);
      } catch (error) {
        console.error('Erreur lors de la récupération des users:', error);
      }
    }
  
    fetchUsers();
  }, []);

  async function Load() {
    const result = await axiosClient.get("/courses");
    setCourses(result.data.results);
  }

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    editCourse(course);
  };

  const handleUserChange = (selectedOption) => {


    setUser_id(selectedOption.value);  // Stocker l'ID de l'utilisateur sélectionné
    console.log('Utilisateur sélectionné:', selectedOption);
  };

  async function editCourse(course) {
    setName(course.name);
    setDuration(course.duration);
    setUser_id(course.user_id);
    setmodule_id(course.module_id);
    setDescription(course.description);
    setId(course.id);
    setPhoto(null); // On ne garde pas l'ancienne image, car on veut une nouvelle sélection
  }

  async function update(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    if (duration) formData.append('duration', duration);
    if (user_id) formData.append('user_id', user_id);
    formData.append('module_id', module_id);
    if (description) formData.append('description', description);
    formData.append('image', fileimage);

    try {
      await axiosClient.post("/updatecourse/" + id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      resetForm();
      toast.success('course mise à jour', 'success');
    } catch (err) {
      toast.error('Échec de la mise à jour de la course');
    }
  }

  async function Deletecourse(id) {
    await axiosClient.delete("/courses/" + id);
    resetForm();
    toast.success('course supprimée avec succès');
  }

  const filteredcourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    resetForm(); // Réinitialiser le formulaire avant d'ouvrir le modal d'ajout
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    editCourse(course);
    setIsModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedCourse(user);
    setIsDeleteModalOpen(true);
};

  return (
    <React.Fragment>
     <ToastContainer />
      {/* Modal pour ajouter un course */}
      <Modal 
        overlayClassName="modal-overlay" 
        className="customModal" 
        isOpen={isModalOpen && !selectedCourse} 
        onRequestClose={() => setIsModalOpen(false)}
      >
        <div className="modal-header">
          <h4 className="modal-title">Ajouter une matiere</h4>
         
        </div>
        <div className="modal-body">
          <form onSubmit={save}>
            <div className="form-group">
                <label htmlFor="courseName">Nom de la matiere</label>
                <input 
                    type="text" 
                    id="courseName" 
                    className="form-control" 
                    placeholder="Nom de la matiere" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="duration">Durée (heur)</label>
                <input 
                    type="text" 
                    id="duration" 
                    className="form-control" 
                    placeholder="Durée" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                     
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
                     
                />
            </div>

            <div className="form-group">
                <label htmlFor="moduleSelect">Module</label>
                <Select
                    value={options.find(option => option.value === module_id)}
                    onChange={handleChange}
                    options={options}
                    placeholder="Choisir un module"
                    className="customSelect"
                    classNamePrefix="custom-select"
                    menuPortalTarget={document.body} // Ajouter cette propriété pour le portail
                    styles={{
                      menuPortal: base => ({
                        ...base,
                        zIndex: 10500 // Assurez-vous que le menu est au-dessus du modal
                      })
                    }}
                />
            </div>

            <div className="form-group">
                <label htmlFor="userSelect">Enseignant(e)</label>
                <Select
                    value={usersOptions.find(option => option.value === user_id)}
                    onChange={handleUserChange}
                    options={usersOptions}
                    placeholder="Choisir un enseignant"
                    className="customSelect"
                    classNamePrefix="custom-select"
                    menuPortalTarget={document.body} // Ajouter cette propriété pour le portail
                    styles={{
                      menuPortal: base => ({
                        ...base,
                        zIndex: 10500 // Assurez-vous que le menu est au-dessus du modal
                      })
                    }}
                />
            </div>


            <label htmlFor="fileInput">Logo du matiere</label>
            {fileimage ? (
    <div className="form-group d-flex align-items-center justify-content-center">

        <label htmlFor="fileInput" className="file-input-label image-selected">
            <img 
                src={fileimage instanceof File ? URL.createObjectURL(fileimage) : `${import.meta.env.VITE_API_BASE_URL}/storage/${fileimage}`} 
                alt="Aperçu de l'image" 
                className="image-preview"
            />
            <input 
                type="file" 
                id="fileInput" 
                className="form-control-file" 
                onChange={(e) => setPhoto(e.target.files[0])} 
            />
        </label>
    </div>
) : (
    <div className="form-group d-flex align-items-center justify-content-center">
        <label htmlFor="fileInput" className="file-input-label">
            <span className="icon">+</span>
            
            <small>PNG, JPG, GIF up to 10MB</small>
            <input 
                type="file" 
                id="fileInput" 
                className="form-control-file" 
                onChange={(e) => setPhoto(e.target.files[0])} 
            />
        </label>
    </div>
)}







            <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                    <i className="fas fa-plus"></i> Ajouter
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => resetForm()}>
                    <i className="fas fa-times"></i> Annuler
                </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal pour modifier un course */}
      <Modal 
        overlayClassName="modal-overlay" 
        className="customModal" 
        isOpen={isModalOpen && selectedCourse} 
        onRequestClose={() => setIsModalOpen(false)}
      >
        <div className="modal-header">
          <h4 className="modal-title">Modifier la matiere</h4>
         
        </div>
        <div className="modal-body">
          <form onSubmit={update}>
            <div className="form-group">
                <label htmlFor="courseName">Nom de la matiere</label>
                <input 
                    type="text" 
                    id="courseName" 
                    className="form-control" 
                    placeholder="Nom de la course" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="duration">Durée (heur)</label>
                <input 
                    type="text" 
                    id="duration" 
                    className="form-control" 
                    placeholder="Durée" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                     
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
                     
                />
            </div>

            <div className="form-group">
                <label htmlFor="moduleSelect">Module</label>
                <Select
                    value={options.find(option => option.value === module_id)}
                    onChange={handleChange}
                    options={options}
                    placeholder="Choisir un module"
                    className="customSelect"
                    classNamePrefix="custom-select"
                    menuPortalTarget={document.body} // Ajouter cette propriété pour le portail
                    styles={{
                      menuPortal: base => ({
                        ...base,
                        zIndex: 10500 // Assurez-vous que le menu est au-dessus du modal
                      })
                    }}
                />
            </div>

            <div className="form-group">
                <label htmlFor="userSelect">Enseignant(e)</label>
                <Select
                    value={usersOptions.find(option => option.value === user_id)}
                    onChange={handleUserChange}
                    options={usersOptions}
                    placeholder="Choisir un enseignant"
                    className="customSelect"
                    classNamePrefix="custom-select"
                    menuPortalTarget={document.body} // Ajouter cette propriété pour le portail
                    styles={{
                      menuPortal: base => ({
                        ...base,
                        zIndex: 10500 // Assurez-vous que le menu est au-dessus du modal
                      })
                    }}
                />
            </div>

            <label htmlFor="fileInput">Logo du course</label>
            {fileimage ? (
    <div className="form-group d-flex align-items-center justify-content-center">

        <label htmlFor="fileInput" className="file-input-label image-selected">
            <img 
                src={fileimage instanceof File ? URL.createObjectURL(fileimage) : `${import.meta.env.VITE_API_BASE_URL}/storage/${fileimage}`} 
                alt="Aperçu de l'image" 
                className="image-preview"
            />
            <input 
                type="file" 
                id="fileInput" 
                className="form-control-file" 
                onChange={(e) => setPhoto(e.target.files[0])} 
            />
        </label>
    </div>
) : (
    <div className="form-group d-flex align-items-center justify-content-center">
        <label htmlFor="fileInput" className="file-input-label">
            <span className="icon">+</span>
            
            <small>PNG, JPG, GIF up to 10MB</small>
            <input 
                type="file" 
                id="fileInput" 
                className="form-control-file" 
                onChange={(e) => setPhoto(e.target.files[0])} 
            />
        </label>
    </div>
)}

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

      {/* Modal de suppression */}
      <Modal 
        overlayClassName="modal-overlay" 
        className="customModal" 
        isOpen={isDeleteModalOpen} 
        onRequestClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="modal-body text-center">
          <p>Voulez-vous supprimer le course {selectedCourse?.name} ?</p>
          <div className="modal-footer justify-content-center">
            <button className="btn btn-danger" onClick={() => Deletecourse(selectedCourse?.id)}>
              <i className="fas fa-trash"></i> Supprimer
            </button>
            <button className="btn btn-secondary" onClick={() => resetForm()}>
              <i className="fas fa-times"></i> Annuler
            </button>
          </div>
        </div>
      </Modal>

      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <h2>Liste des matieres</h2>
            </div>
            <div className="header-bar">
  <button className="btn-create" onClick={openAddModal}>
    <i className="fas fa-plus"></i>
    <span className="btn-label">Créer une matiere</span>
  </button>
  <div className="search-bar">
    <input
      type="text"
      placeholder="Rechercher une matieres..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)} 
      className="search-input"
    />
    <button className="search-btn">
      <i className="fas fa-search"></i>
    </button>
  </div>
</div>

            <div className="card-body px-0 pt-0 pb-2">
              <div className="table-responsive p-0">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Cours</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">module</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Durée</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Prof</th>
                      <th className="text-secondary opacity-7">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredcourses.length > 0 ? (
                filteredcourses.map(course => (
                  <tr key={course.id}>



                        <td>
                          <div className="d-flex px-2 py-1">
                            <div>
                              <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${course.image}`} className="avatar avatar-sm me-3" alt={course.name} />
                            </div>
                            <div className="d-flex flex-column justify-content-center">
                              <h6 className="mb-0 text-sm">{course.name}</h6>
                              <p className="text-xs text-secondary mb-0" style={{ 
      maxWidth: "150px", 
      whiteSpace: "nowrap", 
      overflow: "hidden", 
      textOverflow: "ellipsis" 
    }}>{course.description}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="text-xs font-weight-bold mb-0">{course.module.name}</p>
                    
                        </td>

                        <td className="align-middle text-center text-sm">
    <p className="text-xs font-weight-bold mb-0">
        {course.duration ? `${course.duration} heures` : 'N/A'}
    </p>
</td>

                        <td className="align-middle text-center">
    <span className="text-secondary text-xs font-weight-bold">
        {course.user ? course.user.name : 'N/A'}
    </span>
</td>

                        <td className="align-middle">
  <button className="btn btn-primary me-2" onClick={() => handleEditClick(course)}>
    <i className="fas fa-edit"></i> 
  </button>
  <button className="btn btn-danger" onClick={() => openDeleteModal(course)}>
    <i className="fas fa-trash"></i> 
  </button>
</td>
                        </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>Aucun résultat trouvé</td>
                </tr>
              )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default course;
