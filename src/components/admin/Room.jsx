import axios from 'axios';
import { useEffect, useState } from "react";
import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import axiosClient from '../../axiosClient';

Modal.setAppElement('#root');

function Room() {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [id, setId] = useState('');
    const [room_number, setRoom_number] = useState("");

    const [capacity, setCapacity]= useState('');
    

    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // Nouvel état pour la barre de recherche
    





    useEffect(() => {
        (async () => await Load())();
    }, []);

    async function Load() {
        const result = await axiosClient.get("/rooms");
        console.log('room from API:', result.data);
        setRooms(result.data);
    }
    


    const handleClose = () => {
        setNotification(null);
    };

    const handleEditClick = (room) => {
        setSelectedRoom(room);
        setIsModalOpen(true); 
        editRoom(room);
    };

    async function editRoom(room) {
       
        setRoom_number(room.room_number);
      
        setId(room.id);
       
        setCapacity(room.capacity);
        
    }
    async function save(event) {
      event.preventDefault();
      try {
        // formdat
        const formData= new FormData();

        formData.append('room_number',room_number);
    
        formData.append('capacity', capacity);
    
        await axiosClient.post("/rooms", 
          
          formData, {
            headers:{'Content-Type':"multipart/form-data"},
        }
        
          
        );
    
        
        toast.success("Salle enregistrée avec succès");
        resetForm(); // Réinitialiser le formulaire après l'ajout réussi
        
      } catch (err) {
  
        toast.error("Échec de l'enregistrement de la Salle");
      }
    }

    async function update(event) {
        event.preventDefault(); // Empêche le rechargement de la page lors de l'envoi du formulaire
    
        try {
            const data = {
                room_number: room_number,
                capacity: capacity,
            };
            console.log("val :", data); // Pour afficher les données dans la console
    
            // Envoie une requête PUT pour mettre à jour la salle
            await axiosClient.put(`/rooms/${id}`, data);
    
            resetForm(); // Réinitialiser le formulaire après la mise à jour
            toast.success('Salle mise à jour avec succès'); // Affiche une notification de succès
        } catch (err) {
            // Gère l'erreur si la requête échoue
            if (err.response && err.response.data.errors) {
                // Vérifie s'il y a des erreurs dans la réponse
                const errorMessage = err.response.data.errors.room_number
                    ? err.response.data.errors.room_number[0] // Si l'erreur est liée au numéro de salle
                    : 'Erreur lors de la mise à jour de la salle'; // Message d'erreur générique
                    resetForm(); // Réinitialiser le formulaire après la mise à jour
    
                toast.error(errorMessage); // Affiche le message d'erreur dans un toast
            } else {
            resetForm(); // Réinitialiser le formulaire après la mise à jour

                // Si l'erreur ne correspond pas à une validation Laravel, affiche un message d'erreur générique
                toast.error('Échec de la mise à jour de la salle');
            }
        }
    }
    
    

    async function DeleteRoom(id) {
        await axiosClient.delete(`/rooms/${id}`);
        resetForm();
        toast.success('Salle supprimée avec succès');
    }

    const resetForm = () => {
        setId("");
    
        setRoom_number('');
      
        setCapacity('');
        setSelectedRoom(null);
        Load();
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
    };

    const openDeleteModal = (room) => {
        setSelectedRoom(room);
        setIsDeleteModalOpen(true); 
    };

    const handleAddClick = () => {
        resetForm(); // Réinitialiser le formulaire avant d'ouvrir le modal d'ajout
        setIsModalOpen(true);
    };

    // Filtrer les rooms en fonction de la recherche
    const filteredrooms = rooms.filter(room =>
        room.capacity === parseInt(searchQuery) ||  // Comparaison exacte avec searchQuery converti en nombre
        room.room_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    

    return (
        <React.Fragment>

              <ToastContainer />
      
                    {/* Modal pour ajouter une room */}
                    <Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isModalOpen && !selectedRoom} 
    onRequestClose={() => setIsModalOpen(false)}
>
    <div className="modal-header">
        <h4 className="modal-title">Ajouter une salle</h4>
       
    </div>
    <div className="modal-body">
        <form onSubmit={save}>
  

            <div className="form-group">
                <label htmlFor="room_number">Numero de la salle</label>
                <input 
                    type="text" 
                    id="room_number" 
                    className="form-control" 
                    placeholder="room_number" 
                    value={room_number} 
                    onChange={(e) => setRoom_number(e.target.value)} 
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="capacity">Capacite de la salle</label>
                <input 
                    type="number" 
                    id="capacity" 
                    className="form-control" 
                    placeholder="capacity" 
                    value={capacity} 
                    onChange={(e) => setCapacity(e.target.value)} 
                    required 
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

{/* Modal pour modifier une room */}
<Modal 
    overlayClassName="modal-overlay" 
    className="customModal" 
    isOpen={isModalOpen && selectedRoom} 
    onRequestClose={() => setIsModalOpen(false)}
>
  
    <div className="modal-header">
   
        <h4 className="modal-title">Modifier la salle</h4>
      
    </div>
    <div className="modal-body">
        <form onSubmit={update}>
         

            <div className="form-group">
                <label htmlFor="room_number">room_number</label>
                <input 
                    type="text" 
                    id="room_number" 
                    className="form-control" 
                    placeholder="room_number" 
                    value={room_number} 
                    onChange={(e) => setRoom_number(e.target.value)} 
                    required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="capacity">capacite de la salle</label>
                <input 
                    type="number" 
                    id="capacity" 
                    className="form-control" 
                    placeholder="capacite de la salle" 
                    value={capacity} 
                    onChange={(e) => setCapacity(e.target.value)} 
                    required 
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
        <p>Voulez-vous supprimer la salle {selectedRoom?.room_number} ?</p>
        <div className="modal-footer justify-content-center">
            <button className="btn btn-danger" onClick={() => DeleteRoom(selectedRoom?.id)}>
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
      <h2>Liste des salle</h2>
      </div>
      
      <div className="header-bar">
        {/* Bouton pour ajouter une room */}
        <button className="btn-create" onClick={handleAddClick}>
          <i className="fas fa-plus"></i> Nouvelle salle
        </button>
        
        {/* Barre de recherche */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher une salle..."
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
         
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">#id</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">numero de la salle</th>
                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">capacite de la sall</th>

               
                <th className="text-secondary opacity-7">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredrooms.length > 0 ? (
                filteredrooms.map(room => (
                  <tr key={room.id}>
                 
                    <td>
                      <p className="text-xs font-weight-bold mb-0">  {room.id}</p>
                    </td>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{room.room_number}</p>
                    </td>
                    <td>
                      <p className="text-xs font-weight-bold mb-0">{room.capacity}</p>
                    </td>
                   
                   
                    <td className="align-middle">
  <button className="btn btn-primary me-2" onClick={() => handleEditClick(room)}>
    <i className="fas fa-edit"></i> 
  </button>
  <button className="btn btn-danger" onClick={() => openDeleteModal(room)}>
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

export default Room;
