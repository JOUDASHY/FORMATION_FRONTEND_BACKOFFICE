import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import axiosClient from '../../axiosClient';
Modal.setAppElement('#root');

const Planning = () => {
  const [schedules, setSchedules] = useState([]);
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState(null);
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
  const [formationId, setFormationId] = useState(null);

  const getStartOfWeek = (date) => {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };
  const handleFormationSelect = (formation) => {
    setSelectedFormation(formation.id);
    setFormationId(formation.id); // Mettez à jour formationId ici
  };
  
  useEffect(() => {
    const today = new Date();
    setStartOfWeek(getStartOfWeek(today));
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

  const fetchSchedules = async () => {
    try {
      const response = await axiosClient.get('/Planning_apprenant');
      setSchedules(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des plannings:', error);
    }
  };

  const fetchFormations = async () => {
    try {
      const response = await axiosClient.get('/Formation_apprenant'); // Correction du chemin
      setFormations(response.data.results); // Supposons que response.data est un tableau de formations
    } catch (error) {
      console.error('Erreur lors de la récupération des formations:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosClient.get('/courses');
      const formattedOptions = response.data.results.map(course => ({
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
    fetchFormations(); // Ajout de la récupération des formations
    fetchCourses();
  }, []);


  const renderGrid = () => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const timeSlots = ['08:00:00', '10:00:00', '12:00:00', '14:00:00', '16:00:00', '18:00:00'];

    const filteredSchedules = selectedFormation
      ? schedules.filter(schedule => schedule.formation_id === selectedFormation)
      : schedules;

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
                const schedule = filteredSchedules.find(
                  (s) => s.date === dayToDate[day] && s.start_time === timeSlot
                );
                const courseName = schedule ? coursesOptions.find(course => course.value === schedule.course_id)?.label : null;

                return (
                  <td
                    key={`${day}-${timeSlot}`}
                    className={`cell ${schedule ? 'occupied' : ''}`}
                 
                    style={{ padding: '20px', height: '80px', border: '1px solid #ddd', verticalAlign: 'middle' }}>
                    {courseName || 'Libre'}
                    {schedule && (
                      <i
                        className="fas fa-times"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(schedule);
                        }}
                        style={{ cursor: 'pointer', color: 'red', marginLeft: '8px' }}
                      />
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
    <header className="navbar" style={{ backgroundColor: 'white', border: 'white solid 50px', borderRadius: '30px' }}>
      <center>
        <h2>Emploi du Temps</h2>
        <h3>Semaine du {startDate} au {endDateString}</h3>
      </center>
  
      {/* Navbar pour les formations */}
      <nav className="navbar-menu">
        {formations.map((formation) => (
          <button
            key={formation.id}
           
            className={`nav-button ${selectedFormation === formation.id ? 'active' : ''}`}
            style={{ marginRight: '10px' }}
          >
            {formation.name}
          </button>
        ))}
      </nav>
    </header>
  
    <section className="schedule-content">
      {renderGrid()}
    </section>



    </div>
  );
};

export default Planning;
