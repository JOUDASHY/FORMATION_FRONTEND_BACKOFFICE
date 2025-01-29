import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Select from 'react-select';
import axiosClient from '../../axiosClient';

Modal.setAppElement('#root');

function Module() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [id, setId] = useState('');
  const [name, setName] = useState("");
  const [formation_id, setFormation_id] = useState(null);
  const [description, setDescription] = useState("");

  const [duration, setDuration] = useState("");
  const [fileimage, setPhoto] = useState(null);
  const [modules, setModules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [formationsMap, setFormationsMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchFormations() {
      try {
        const response = await axiosClient.get('/formations');
        const formattedOptions = response.data.results.map((formation) => ({
          value: formation.id,
          label: formation.name
        }));
        setOptions(formattedOptions);
        // Remplir le mapping des formations
        const map = response.data.results.reduce((acc, formation) => {
          acc[formation.id] = formation.name;
          return acc;
        }, {});
        setFormationsMap(map);
      } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error);
      }
    }
    fetchFormations();
  }, []);

  const handleChange = (selectedOption) => {
    setSelectedFormation(selectedOption);
    setFormation_id(selectedOption.value);
  };

  async function save(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    // formData.append('duration', duration);
    formData.append('description', description);
    formData.append('formation_id', formation_id);

    formData.append('image', fileimage);

    try {
      await axiosClient.post("/modules", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Module enregistrée avec succès");
      resetForm();
    } catch (err) {
      toast.error("Échec de l'enregistrement de la module");
    }
  }

  const resetForm = () => {
    setId("");
    setName('');
    setFormation_id(null);
    setDescription('');

    setPhoto(null);
    setSelectedModule(null);
    Load();
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    (async () => await Load())();
  }, []);



  const openDeleteModal = (module) => {
    setSelectedModule(module);
    setIsDeleteModalOpen(true); 
};



  async function Load() {
    const result = await axiosClient.get("/modules");
    setModules(result.data.results);
  }

  const handleEditClick = (module) => {
    setSelectedModule(module);
    setIsModalOpen(true);
    editModule(module);
  };

  async function editModule(module) {
    setName(module.name);
    // setDuration(module.duration);

    setFormation_id(module.formation_id);
    setDescription(module.description);
    setId(module.id);
    setPhoto(null); // On ne garde pas l'ancienne image, car on veut une nouvelle sélection
  }

  async function update(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    // formData.append('duration', duration);

    formData.append('formation_id', formation_id);
    formData.append('description', description);
    formData.append('image', fileimage);

    try {
      await axiosClient.post("/updatemodule/" + id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      resetForm();
      toast.success('Module mise à jour');
    } catch (err) {
      toast.success('Échec de la mise à jour de la module');
    }
  }

  async function DeleteModule(id) {
    await axiosClient.delete("/modules/" + id);
    resetForm();
    toast.success('Module supprimée avec succès');
  }

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    resetForm(); // Réinitialiser le formulaire avant d'ouvrir le modal d'ajout
    setIsModalOpen(true);
  };

  const openEditModal = (module) => {
    setSelectedModule(module);
    setIsModalOpen(true);
    editModule(module);
  };

  return (
    <React.Fragment>
              <ToastContainer />


   {/* Modal pour ajouter un module */}
<Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isModalOpen && !selectedModule} 
    onRequestClose={() => setIsModalOpen(false)}
>
    <div className="modal-header">
        <h4 className="modal-title">
            Ajouter un module
        </h4>
     
    </div>

    <div className="modal-body">
        <form onSubmit={save}>
            <div className="form-group">
                <label htmlFor="moduleName">Nom du module</label>
                <input 
                    type="text" 
                    id="moduleName" 
                    className="form-control" 
                    placeholder="Nom du module" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
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
                <label htmlFor="formation">Formation</label>
                <Select
                    value={options.find(option => option.value === formation_id)}
                    onChange={handleChange}
                    options={options}
                    placeholder="Choisir une formation"
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

            <label htmlFor="fileInput">Logo du module</label>
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
                <button className='btn btn-secondary' type="button" onClick={() => resetForm()}>
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
    isOpen={isModalOpen && selectedModule} 
    onRequestClose={() => setIsModalOpen(false)}
>
    <div className="modal-header">
        <h4 className="modal-title">
            Modifier le module
        </h4>
       
    </div>

    <div className="modal-body">
        <form onSubmit={update}>
            <div className="form-group">
                <label htmlFor="moduleName">Nom du module</label>
                <input 
                    type="text" 
                    id="moduleName" 
                    className="form-control" 
                    placeholder="Nom du module" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
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
                <label htmlFor="formation">Formation</label>
                <Select
                    value={options.find(option => option.value === formation_id)}
                    onChange={handleChange}
                    options={options}
                    placeholder="Choisir une formation"
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

            <label htmlFor="fileInput">Logo du module</label>
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
                <button className='btn btn-secondary' type="button" onClick={() => resetForm()}>
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
        <p>Voulez-vous supprimer le module {selectedModule?.name} ?</p>
        <div className="modal-footer justify-content-center">
            <button className='btn btn-danger' onClick={() => DeleteModule(selectedModule?.id)}>
                <i className="fas fa-trash"></i> Supprimer
            </button>
            <button className='btn btn-secondary' onClick={() => resetForm()}>
                <i className="fas fa-times"></i> Annuler
            </button>
        </div>
    </div>
</Modal>



<div className="row">
  <div className="col-12">
    <div className="card mb-4">
      <div className="card-header pb-0">
      <h2>Liste des modules</h2>

      </div>

      <div className="header-bar">
        <button className="btn-create" onClick={() => openAddModal()}>
          <i className="fas fa-plus"></i> Nouvelle module
        </button>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher une module"
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
              
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nom</th>
               
                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Formation</th>
                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Description</th>

                <th className="text-secondary opacity-7">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredModules.length > 0 ? (
                filteredModules.map(module => (
                  <tr key={module.id}>
            
                    <td><img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${module.image}`} className="avatar avatar-sm me-3" /> {module.name}</td>
                  
                    <td className="text-center">{module.formation.name || 'N/A'}</td>
                    <td style={{ 
      maxWidth: "150px", 
      whiteSpace: "nowrap", 
      overflow: "hidden", 
      textOverflow: "ellipsis" 
    }}>
  <p className="text-xs font-weight-bold mb-0">
    {module.description}
  </p>
</td>

                    
                    <td className="align-middle">
  <button className="btn btn-primary me-2" onClick={() => handleEditClick(module)}>
    <i className="fas fa-edit"></i> 
  </button>
  <button className="btn btn-danger" onClick={() => openDeleteModal(module)}>
    <i className="fas fa-trash"></i> 
  </button>
</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>Aucun résultat trouvé</td>
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

export default Module;
