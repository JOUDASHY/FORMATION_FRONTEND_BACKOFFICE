import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';

import axiosClient from '../../axiosClient';

Modal.setAppElement('#root');

const Planning_formateur = ({user}) => {

  const [schedules, setSchedules] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [room, setRoom] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [coursesOptions, setCoursesOptions] = useState([]);
  const [roomsOptions, setRoomsOptions] = useState([]); // État pour les options de salles
  const [loadingRooms, setLoadingRooms] = useState(true); // État pour gérer le chargement

  const [startOfWeek, setStartOfWeek] = useState(new Date()); // Date de début de la semaine

  const getStartOfWeek = (date) => {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };


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

  const isPause = (startTime) => {
    return startTime === '12:00:00';
  };
  

  const fetchSchedules = async () => {
    try {

      const response = await axiosClient.get(`/Planning_formateur_EDT`);
      setSchedules(response.data);

    } catch (error) {
      console.error('Erreur lors de la récupération des plannings:', error);
    }
  };
  const fetchUserDetails = async () => {
    try {
    
      const response = await axiosClient.get(`/users/${user.id}`);
      setUserDetails(response.data);
      console.log("nom :",userDetails  );
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la formation:', error);
    }
  };



  
  useEffect(() => {
 
    fetchSchedules();

    fetchUserDetails();

  }, []);


  

  

  const getEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 2;
    return `${endHours}:${minutes < 10 ? '0' + minutes : minutes}`;
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
                const formationName = schedule ? schedule.formations.name : null; // Nom du formateur
              
                return (
                  
            
<td
  key={`${day}-${timeSlot}`}
  className={`cell ${isPause(timeSlot) ? 'pause' : schedule ? 'occupied' : ''}`}
  style={{
    padding: '20px',
    height: '80px',
    border: '1px solid #ddd',
    verticalAlign: 'middle',
    backgroundColor: isPause(timeSlot) ? '#f0ad4e' : '', // Couleur pour les pauses
    cursor: isPause(timeSlot) ? 'not-allowed' : 'pointer', // Empêche le clic si c'est une pause
  }}
>
  {isPause(timeSlot) ? 'Pause' : courseName || 'Libre'}
  
  {schedule && !isPause(timeSlot) && (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {roomNumber && <span>{`Salle: ${roomNumber}`}</span>}
      {formationName && <span>{`Apprenant: ${formationName}`}</span>}
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
        <h2>Emploi du Temps du formateur <b> {userDetails ? userDetails.name : 'Chargement...'}</b> </h2>
        <h3>Semaine du {startDate} au {endDateString}</h3>
      </center>
 
    </header>
  
    <section className="schedule-content">
      {renderGrid()}
    </section>


    </div>
  );
};

export default Planning_formateur;
