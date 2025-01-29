import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import axiosClient from '../../axiosClient';

Modal.setAppElement('#root');

function Formation() {
    const [selectedFormation, setSelectedFormation] = useState(null);
    const [id, setId] = useState('');
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    
    const [fileimage, setPhoto]= useState('');
    const [start_date, setStart_date] = useState("");
    const [formations, setFormations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // Nouvel état pour la barre de recherche
    
    const [tariff, setTariff] = useState("");





    useEffect(() => {
        (async () => await Load())();
    }, []);

    async function Load() {
        const result = await axiosClient.get("/formations");
        setFormations(result.data.results);
        
    }


    const handleClose = () => {
        setNotification(null);
    };

    const handleEditClick = (formation) => {
        setSelectedFormation(formation);
        setIsModalOpen(true); 
        editFormation(formation);
    };

    async function editFormation(formation) {
        setName(formation.name);
        setDescription(formation.description);
        setDuration(formation.duration);
        setStart_date(formation.start_date);
        setId(formation.id);
        setPhoto(formation.image);
        setTariff(formation.tariff);
        
    }
    async function save(event) {
      event.preventDefault();
      try {
        // formdat
        const formData= new FormData();
        formData.append('name', name);
        formData.append('description',description);
        formData.append('duration',duration);
        formData.append('image', fileimage);
        formData.append('tariff', tariff);
        formData.append('start_date', start_date);

        await axiosClient.post("/formations", 
          
          formData, {
            headers:{'Content-Type':"multipart/form-data"},
        }
        
          
        );
    
        
        toast.success("Formation enregistrée avec succès");
        resetForm(); // Réinitialiser le formulaire après l'ajout réussi
        
      } catch (err) {
  
        toast.error("Échec de l'enregistrement de la formation");
      }
    }

    async function update(event) {
        event.preventDefault();
        console.log("Updating with data:", { id, name, description, fileimage, start_date }); // Ajoutez ceci pour le débogage
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            if(duration) {
                if(duration)formData.append('duration', duration);}
            formData.append('image', fileimage);
            if(start_date) formData.append('start_date', start_date);
            if(tariff)formData.append('tariff', tariff);

    
            await axiosClient.post(`/updateformation/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            resetForm();
            toast.success('Formation mise à jour');
        } catch (err) {
            toast.error('Échec de la mise à jour de la formation');
        }
    }
    

    async function DeleteFormation(id) {
        await axiosClient.delete(`/formations/${id}`);
        resetForm();
        toast.success('Formation supprimée avec succès');
    }

    const resetForm = () => {
        setId("");
        setName('');
        setDescription('');
    setDuration('');

        setStart_date('');
        setPhoto('');
        setTariff('');
        setSelectedFormation(null);
        Load();
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
    };

    const openDeleteModal = (formation) => {
        setSelectedFormation(formation);
        setIsDeleteModalOpen(true); 
    };

    const handleAddClick = () => {
        resetForm(); // Réinitialiser le formulaire avant d'ouvrir le modal d'ajout
        setIsModalOpen(true);
    };

    // Filtrer les formations en fonction de la recherche
    const filteredFormations = formations.filter(formation =>
        formation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formation.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <React.Fragment>

              <ToastContainer />
      
                    {/* Modal pour ajouter une formation */}
                    <Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isModalOpen && !selectedFormation} 
    onRequestClose={() => setIsModalOpen(false)}
>
    <div className="modal-header">
        <h4 className="modal-title">Ajouter une formation</h4>
       
    </div>
    <div className="modal-body">
        <form onSubmit={save}>
            <div className="form-group">
                <label htmlFor="formationName">Nom de la formation</label>
                <input 
                    type="text" 
                    id="formationName" 
                    className="form-control" 
                    placeholder="Nom de la formation" 
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
                    // required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="tariff">Frais de formation (Ar)</label>
                <input 
                    type="number" 
                    id="tariff" 
                    className="form-control" 
                    placeholder="Tarif" 
                    value={tariff} 
                    onChange={(e) => setTariff(e.target.value)} 
                    // required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="duration">Durée (nombre des jours)</label>
                <input 
                    type="number" 
                    id="duration" 
                    className="form-control" 
                    placeholder="Durée" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                    // required 
                />
            </div>
            <label htmlFor="fileInput">Image(logo)</label>

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


            <div className="form-group">
    <label htmlFor="startDate">Date de début</label>
    <input 
        type="date" 
        id="startDate" 
        className="form-control" 
        value={start_date} 
        onChange={(e) => setStart_date(e.target.value)} 
        min={new Date().toISOString().split("T")[0]} 
        // required 
    />
</div>



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

{/* Modal pour modifier une formation */}
<Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isModalOpen && selectedFormation} 
    onRequestClose={() => setIsModalOpen(false)}
>
  
    <div className="modal-header">
   
        <h4 className="modal-title">Modifier la formation</h4>
      
    </div>
    <div className="modal-body">
        <form onSubmit={update}>
            <div className="form-group">
                <label htmlFor="formationName">Nom de la formation</label>
                <input 
                    type="text" 
                    id="formationName" 
                    className="form-control" 
                    placeholder="Nom de la formation" 
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
                    // required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="tariff">Frais de formation (Ar)</label>
                <input 
                    type="number" 
                    id="tariff" 
                    className="form-control" 
                    placeholder="Tarif" 
                    value={tariff} 
                    onChange={(e) => setTariff(e.target.value)} 
                    // required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="duration">Durée (nbr des jours)</label>
                <input 
                    type="text" 
                    id="duration" 
                    className="form-control" 
                    placeholder="Durée" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                    // required 
                />
            </div>
            <label htmlFor="fileInput">Image(logo)</label>

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



     <div className="form-group">
                <label htmlFor="startDate">Date de début</label>
                <input 
                    type="date" 
                    id="startDate" 
                    className="form-control" 
                    value={start_date} 
                    onChange={(e) => setStart_date(e.target.value)} 
                    // required 
                />
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

{/* Modal de suppression */}
<Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isDeleteModalOpen} 
    onRequestClose={() => setIsDeleteModalOpen(false)}
>
    <div className="modal-body text-center">
        <p>Voulez-vous supprimer la formation {selectedFormation?.name} ?</p>
        <div className="modal-footer justify-content-center">
            <button className="btn btn-danger" onClick={() => DeleteFormation(selectedFormation?.id)}>
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
      <h2>Liste des formations</h2>
      </div>
      
      <div className="header-bar">
  {/* Bouton pour ajouter une formation */}
  <button className="btn-create" onClick={handleAddClick}>
    <i className="fas fa-plus"></i> <span className="btn-label">Nouvelle formation</span>
  </button>
  
  {/* Barre de recherche */}
  <div className="search-bar">
    <input
      type="text"
      placeholder="Rechercher une formation"
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
         
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Titre</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Description</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Frais de Formation</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Durée (en jour)</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Début</th>
                <th className="text-secondary opacity-7">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredFormations.length > 0 ? (
                filteredFormations.map(formation => (
                  <tr key={formation.id}>
                 
                    <td>
                      <p className="text-xs font-weight-bold mb-0">  <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${formation.image}`} className="avatar avatar-sm me-3 fixed-image" alt={formation.name} /> {formation.name}</p>
                    </td>
                    <td style={{ 
  maxWidth: "150px", 
  whiteSpace: "nowrap", 
  overflow: "hidden", 
  textOverflow: "ellipsis" 
}}>
  <p className="text-xs font-weight-bold mb-0">
    {formation.description || 'Aucune description'}
  </p>
</td>

<td>
  <p className="text-xs font-weight-bold mb-0">
    {formation.tariff ? `${formation.tariff} Ar` : 'Tarif non défini'}
  </p>
</td>

<td>
  <p className="text-xs font-weight-bold mb-0">
    {formation.duration ? `${formation.duration} jours` : 'Durée non définie'}
  </p>
</td>

<td>
  <p className="text-xs font-weight-bold mb-0">
    {formation.start_date ? formation.start_date : 'Date de début non définie'}
  </p>
</td>

                    <td className="align-middle">
  <button className="btn btn-primary me-2" onClick={() => handleEditClick(formation)}>
    <i className="fas fa-edit"></i> 
  </button>
  <button className="btn btn-danger" onClick={() => openDeleteModal(formation)}>
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

export default Formation;
