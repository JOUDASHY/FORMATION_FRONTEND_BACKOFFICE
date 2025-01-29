import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link,useParams } from 'react-router-dom';
import axiosClient from '../../axiosClient';
import Swal from 'sweetalert2';

Modal.setAppElement('#root');

const Planning_admin = ({user}) => {
  const { formationId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [formationDetails, setFormationDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [room, setRoom] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [coursesOptions, setCoursesOptions] = useState([]);
  const [notification, setNotification] = useState(null);
  const [startOfWeek, setStartOfWeek] = useState(new Date()); // Date de début de la semaine

  const getStartOfWeek = (date) => {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };
  const [roomsOptions, setRoomsOptions] = useState([]); // État pour les options de salles
  const [loadingRooms, setLoadingRooms] = useState(true); // État pour gérer le chargement

  useEffect(() => {
    // Fonction pour récupérer les salles depuis l'API
    const fetchRooms = async () => {
        try {
            const response = await axiosClient.get('/rooms');
            const formattedRooms = response.data.map(room => ({
                label: `Salle ${room.room_number}`,
                value: room.id,
            }));
            setRoomsOptions(formattedRooms);
            setLoadingRooms(false);
        } catch (error) {
            console.error("Erreur lors du chargement des salles :", error);
            setLoadingRooms(false);
        }
    };

    fetchRooms();
}, []);
  
  useEffect(() => {
    const today = new Date();
    setStartOfWeek(getStartOfWeek(today));
    if (!user || !user.type) {
      console.error('User or user.type is not defined');
    }
    
  }, []);

  const isPause = (startTime) => {
    return startTime === '12:00:00';
  };
  

  const getDateForDay = (dayOffset) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dayOffset);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  const dayToDate = {
    'Lundi': getDateForDay(0),
    'Mardi': getDateForDay(1),
    'Mercredi': getDateForDay(2),
    'Jeudi': getDateForDay(3),
    'Vendredi': getDateForDay(4),
  };

  const fetchSchedules = async () => {
    try {
      const id = parseInt(formationId, 10);
      const response = await axiosClient.get(`/plannings?formation_id=${id}`);
      console.log("Plannings récupérés :", response.data);
      setSchedules(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des plannings:', error);
    }
  };
  
  const fetchFormationDetails = async () => {
    try {
      const id = parseInt(formationId, 10);
      const response = await axiosClient.get(`/formations/${id}`);
      setFormationDetails(response.data.formation);
      console.log("nom :",formationDetails  );
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la formation:', error);
    }
  };



  const fetchCourses = async (day, startTime) => {
    try {
      const id = parseInt(formationId, 10);

      const response = await axiosClient.get(`/coursesByFormation/${id}`);
      const allCourses = response.data.courses;
  
      // Récupérer les emplois du temps existants à cette date et heure pour filtrer
      const occupiedSchedules = schedules.filter(schedule => 
        schedule.date === day && schedule.start_time === startTime
      );
  
      const availableCourses = allCourses.filter(course => {
        // Vérifiez si le formateur est occupé
        const isOccupied = occupiedSchedules.some(schedule => schedule.course_id === course.id);
        return !isOccupied; // Inclure uniquement les cours où le formateur n'est pas occupé
      });
  
      // Formater les options de cours pour l'affichage dans le Select
      const formattedOptions = availableCourses.map(course => ({
        value: course.id,
        label: course.name,
      }));
  
      setCoursesOptions(formattedOptions);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
    }
  };
  
  useEffect(() => {
 
    fetchSchedules();
  
    fetchCourses();
    fetchFormationDetails();

  }, [formationId]);


  const handleCellClick = (day, startTime) => {
    const schedule = schedules.find(
      (s) => s.date === dayToDate[day] && s.start_time === startTime
    );
  
    if (schedule) {
      setSelectedSchedule(schedule);
      setSelectedCourse(coursesOptions.find(course => course.value === schedule.course_id));
      setRoom(roomsOptions.find(room => room.value === schedule.room_id));  // Pré-sélectionner la salle
    } else {
      setSelectedSchedule(null);
      setSelectedCourse('');
      setRoom('');  // Réinitialiser la sélection de la salle
    }
  
    // Enregistrez le jour et l'heure de début
    setDay(dayToDate[day]);
    setStartTime(startTime);
  
    // Appeler fetchCourses pour charger les cours disponibles pour cette heure et ce jour
    fetchCourses(dayToDate[day], startTime);
  
    setIsModalOpen(true); // Ouvrir le modal pour ajouter/modifier
  };
  
  
  // Fonction de soumission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Vérifiez si tous les champs requis sont remplis
    if (!selectedCourse || !day || !startTime || !room || !formationId) {
        Swal.fire({
            icon: 'error',
            title: 'Champs manquants',
            text: 'Tous les champs obligatoires doivent être remplis.',
        });
        return;
    }

    // Créez un nouvel emploi du temps avec toutes les informations nécessaires
    const newSchedule = {
        course_id: selectedCourse.value,
        date: day,
        start_time: startTime,
        end_time: getEndTime(startTime), // Calculez l'heure de fin
        room_id: room.value, // Assurez-vous d'envoyer uniquement l'ID de la salle
        formation_id: formationId, // Assurez-vous que l'ID de la formation est utilisé
    };

    try {
        if (selectedSchedule) {
            // Mise à jour d'un emploi du temps existant
            await axiosClient.put(`/plannings/${selectedSchedule.id}`, newSchedule);
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Emploi du temps mis à jour avec succès.',
            });
        } else {
            console.log('Plannings : ', newSchedule);

            // Ajout d'un nouvel emploi du temps
            await axiosClient.post('/plannings', newSchedule);
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Emploi du temps ajouté avec succès.',
            });
        }

        // Rechargez les emplois du temps après l'ajout ou la mise à jour
        fetchSchedules();
        setIsModalOpen(false); // Fermez le modal après soumission
    } catch (error) {
        // Vérifiez si le backend a renvoyé une réponse avec des détails d'erreur
        if (error.response && error.response.data && error.response.data.message) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.response.data.message,
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de l\'ajout ou de la mise à jour.',
            });
        }
    }
};

  

  const getEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 2;
    return `${endHours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };

  const openDeleteModal = (schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    try {
      await axiosClient.delete(`/plannings/${selectedSchedule.id}`);
      toast.success('Emploi du temps supprimé avec succès');
      fetchSchedules();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'emploi du temps');
    }
  };
  

  const renderGrid = () => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const timeSlots = ['08:00:00', '10:00:00', '12:00:00', '14:00:00', '16:00:00'];


    return (
<table className="scheduler-table">
  <thead>
    <tr>
      <th>Heure</th>
      {days.map((day) => (
        <th key={day}>{day}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {timeSlots.map((timeSlot) => (
      <tr key={timeSlot}>
        <td>{timeSlot}</td>
        {days.map((day) => {
          const schedule = schedules.find(
            (s) => s.date === dayToDate[day] && s.start_time === timeSlot
          );
          const courseName = schedule ? schedule.courses.name : null;
          const room = schedule ? schedule.rooms : null; // Obtenir l'objet complet de la salle
          const roomNumber = room ? room.room_number : null; // Extraire room_number
          const teacherName = schedule ? schedule.courses.user.name : null; // Nom du formateur

          return (
            <td
              key={`${day}-${timeSlot}`}
              className={`cell ${isPause(timeSlot) ? 'pause' : schedule ? 'occupied' : ''}`}
              onClick={() => {
                if (!isPause(timeSlot) && user.type === 'admin') {
                  handleCellClick(day, timeSlot);
                }
              }}
              style={{
                padding: '20px',
                height: '80px',
                border: '1px solid #ddd',
                verticalAlign: 'middle',
                backgroundColor: isPause(timeSlot) ? '#f0ad4e' : '', // Couleur pour indiquer la pause
                cursor: isPause(timeSlot) ? 'not-allowed' : 'pointer', // Curseur non autorisé
              }}
            >
              {isPause(timeSlot) ? 'Pause' : courseName || 'Libre'}

              {schedule && !isPause(timeSlot) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {roomNumber && <span>{`Salle: ${roomNumber}`}</span>}
                  {teacherName && <span>{`Prof: ${teacherName}`}</span>}
                  {user.type === 'admin' && (
                    <i
                      className="fas fa-times"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(schedule);
                      }}
                      style={{ cursor: 'pointer', color: 'red', marginLeft: '8px' }}
                    />
                  )}
                </div>
              )}
            </td>
          );
        })}
      </tr>
    ))}
  </tbody>
</table>

    );
  };

  // Affichage de la date de la semaine
  const startDate = startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const endDate = new Date(startOfWeek);
  endDate.setDate(endDate.getDate() + 4); // Ajoute 4 jours pour obtenir le vendredi
  const endDateString = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  return (
    <div className="planning-container">
    <header className="" style={{ backgroundColor: 'white', border: 'white solid 50px', borderRadius: '30px' }}>
      <center>
        <h2>Emploi du Temps du formation <b> {formationDetails ? formationDetails.name : 'Chargement...'}</b> </h2>
        <h3>Semaine du {startDate} au {endDateString}</h3>
      </center>
 
    </header>
  
    <section className="schedule-content">
      {renderGrid()}
    </section>

  
 {/* Modal d'ajout/modification */}
 <Modal 
  overlayClassName="modal-overlay" 
  className="customModal" 
  isOpen={isModalOpen} 
  onRequestClose={() => setIsModalOpen(false)}
>
  <div className="modal-header">
    <h4 className="modal-title">
      {selectedSchedule ? "Modifier l'emploi du temps" : "Ajouter un emploi du temps"}
    </h4>
  </div>
  <div className="modal-body">
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <Select
          value={selectedCourse}
          onChange={setSelectedCourse}
          options={coursesOptions}
          placeholder="Sélectionnez un cours"
          required
          menuPortalTarget={document.body} // Ajouter cette propriété pour le portail
          styles={{
            menuPortal: base => ({
              ...base,
              zIndex: 10500 // Assurez-vous que le menu est au-dessus du modal
            })
          }}
        />
      </div>

      {/* Sélecteur pour les salles */}
      <div className="form-group">
        {loadingRooms ? (
          <p>Chargement des salles...</p>
        ) : (
          <Select
            value={room ? roomsOptions.find(option => option.value === room.value) : null} // Pré-sélectionner la salle en utilisant l'objet complet
            onChange={(selectedOption) => setRoom(selectedOption)} // Mettre à jour l'état avec l'objet complet de la salle
            options={roomsOptions}
            placeholder="Sélectionnez une salle"
            required
            menuPortalTarget={document.body}
            styles={{
              menuPortal: base => ({
                ...base,
                zIndex: 10500
              })
            }}
          />
        )}
      </div>

      <div className="form-group">
        <input 
          type="time" 
          value={startTime} 
          onChange={(e) => setStartTime(e.target.value)} 
          required 
          className="form-control" 
        />
      </div>

      <div className="modal-footer">
        <button type="submit" className={`btn ${selectedSchedule ? 'btn-warning' : 'btn-primary'}`}>
          <i className={`fas ${selectedSchedule ? 'fa-edit' : 'fa-plus'}`}></i> 
          {selectedSchedule ? 'Modifier' : 'Ajouter'}
        </button>
        <button type="button" className='btn btn-secondary' onClick={() => setIsModalOpen(false)}>
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
        <h4>Êtes-vous sûr de vouloir supprimer cet emploi du temps ?</h4>
        <p>{selectedSchedule && selectedCourse ? `Cours: ${selectedCourse.label}, Date: ${selectedSchedule.date}, Heure: ${selectedSchedule.start_time}` : ''}</p>
        <div className="modal-footer justify-content-center">
            <button className='btn btn-danger' onClick={handleDelete}>
                Supprimer
            </button>
            <button className='btn btn-secondary' onClick={() => setIsDeleteModalOpen(false)}>
                Annuler
            </button>
        </div>
    </div>
</Modal>

      <ToastContainer />

    </div>
  );
};

export default Planning_admin;
