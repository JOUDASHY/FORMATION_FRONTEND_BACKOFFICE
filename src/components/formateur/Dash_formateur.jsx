import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import axiosClient from "../../axiosClient";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format } from "date-fns";
import moment from "moment";
import { green } from "@mui/material/colors";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [formations, setFormations] = useState([]);
  const [evaluationData, setEvaluationData] = useState({});
  const [freeTimePercentage, setFreeTimePercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [planningData, setPlanningData] = useState([]);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosClient.get("/courses_formateur");
        setCourses(response.data.courses); // Assurez-vous que la réponse contient un tableau de cours
      } catch (error) {
        console.error("Erreur lors de la récupération des cours:", error);
      }
    };

    fetchCourses();
  }, []);
  useEffect(() => {
    // Transformer vos données globalEvents pour le calendrier
    const transformGlobalEvents = () => {
      const globalEvents = {
        Janvier: [
          { date: "2024-01-01", description: "Nouvel An (Jour férié mondial)" },
          // { date: "2024-01-16", description: "Forum économique mondial (Davos, Suisse)" },
          // { date: "2024-01-21", description: "Nouvel An chinois" },
        ],
        Février: [
          { date: "2024-02-04", description: "Journée mondiale contre le cancer" },
          { date: "2024-02-09", description: "Festival international du film de Berlin" },
          { date: "2024-02-14", description: "Saint-Valentin" },
        ],
        Mars: [
          { date: "2024-03-08", description: "Journée mondiale de la femme" },
          { date: "2024-03-29", description: "Anniversaire des événements de 1947" },
        ],
        Mai: [
          { date: "2024-05-01", description: "Fête du travail" },
          { date: "2024-05-29", description: "Ascension" },
        ],
        Novembre: [
          { date: "2024-11-01", description: "Fête de la Mort" },
        ],
        Décembre: [
          { date: "2024-12-10", description: "Journée des droits de l’homme" },
          { date: "2024-12-24", description: "Veillée de Noël" },
          { date: "2024-12-25", description: "Noël" },
        ],
      };

      const transformedEvents = Object.keys(globalEvents).flatMap((month) =>
        globalEvents[month].map((event) => ({
          title: event.description,
          start: new Date(event.date), // Début de l'événement
          end: new Date(event.date),   // Fin de l'événement
        }))
      );
      setEvents(transformedEvents);
    };

    transformGlobalEvents();
  }, []);

  const localizer = momentLocalizer(moment);

  useEffect(() => {
    const fetchFormationsAndEvaluations = async () => {
      try {
        const formationResponse = await axiosClient.get("/Formation_formateur");
        const formations = formationResponse.data.results;
        const evaluations = {};

        for (let formation of formations) {
          const coursesResponse = await axiosClient.get(`/coursesByFormation_formateur/${formation.id}`);
          const courses = coursesResponse.data.courses;

          const responses = await Promise.all(
            courses.map((course) =>
              axiosClient.get(`/evaluations/${formation.id}/${course.id}`)
            )
          );

          const averages = responses.map((response, index) => {
            const notes = response.data.map((evaluation) => evaluation.note);
            const average = notes.reduce((sum, note) => sum + note, 0) / notes.length;
            return { course: courses[index].name, average };
          });

          evaluations[formation.id] = {
            labels: averages.map((item) => item.course),
            datasets: [
              {
                label: "Moyenne des apprenants (sur 20)",
                data: averages.map((item) => item.average),
                backgroundColor: [
                  "rgba(8, 90, 148, 0.6)", // Bleu foncé #085a94
                  "rgba(43, 185, 154, 0.6)", // Vert turquoise #2bb99a
                  "rgba(0, 123, 255, 0.6)", // Bleu clair
                  "rgba(40, 167, 69, 0.6)", // Vert plus foncé
                  "rgba(255, 193, 7, 0.6)", // Jaune doré
                ],
                borderColor: [
                  "rgba(8, 90, 148, 1)", // Bleu foncé #085a94
                  "rgba(43, 185, 154, 1)", // Vert turquoise #2bb99a
                  "rgba(0, 123, 255, 1)", // Bleu clair
                  "rgba(40, 167, 69, 1)", // Vert plus foncé
                  "rgba(255, 193, 7, 1)", // Jaune doré
                ],
                borderWidth: 1,
              },
            ],
          };
          
        }

        setFormations(formations);
        setEvaluationData(evaluations);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        setLoading(false);
      }
    };

    const fetchPlanningData = async () => {
      try {
        const response = await axiosClient.get("/Planning_formateur");
        const data = response.data;
    
        // Obtenir les dates de début (lundi) et de fin (vendredi) de la semaine actuelle
        const { monday, friday } = getWeekStartEndDates();
    
        // Filtrer les données pour ne garder que celles entre lundi et vendredi de cette semaine
        const filteredData = data.filter(item => {
          const itemDate = new Date(item.date); // Assurez-vous que `item.date` est au bon format (ex: ISO string)
          return itemDate >= monday && itemDate <= friday;
        });
    
        setPlanningData(filteredData);
    
        if (filteredData.length >= 20) {
          setFreeTimePercentage(0);
          setLoading(false);
          return;
        }
    
        const occupiedPercentage = (filteredData.length / 20) * 100;
        const freePercentage = 100 - occupiedPercentage;
        setFreeTimePercentage(freePercentage.toFixed(2));
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du planning :", error);
        setLoading(false);
      }
    };
    // Fonction pour obtenir les dates du lundi et vendredi de la semaine en cours
const getWeekStartEndDates = () => {
  const today = new Date();
  
  // Calculer le nombre de jours écoulés depuis lundi
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, diffToMonday = -6, sinon 1 - jour actuel

  // Date du lundi de la semaine
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0); // Minuit

  // Date du vendredi de la semaine
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4); // Vendredi = lundi + 4 jours
  friday.setHours(23, 59, 59, 999); // Dernière minute de vendredi

  return { monday, friday };
};


    fetchFormationsAndEvaluations();
    fetchPlanningData();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  const freeTimeData = {
    labels: ["Temps libre (%)", "Temps occupé (%)"],
    datasets: [
      {
        data: [freeTimePercentage, 100 - freeTimePercentage],
        backgroundColor: ["#085a94", "#2bb99a"], // Remplacement par #085a94 et #2bb99a
        borderColor: ["#085a94", "#2bb99a"], // Idem pour la couleur de bordure
        borderWidth: 1,
      },
    ],
  };

  const freeTimeOptions = {
    cutout: "75%",
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        ticks: { stepSize: 2 },
      },
    },
  };



  return (
<div className="container-fluid py-2">
  {/* Formation Section */}
  <div
  className="row justify-content-center"
  style={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "#e8f9f2", // Un fond plus léger et agréable
    padding: "2rem",
    borderRadius: "10px",
  }}
>
  <h2 className="text-center mb-4" style={{ color: "#2b8f77", fontWeight: "bold" }}>
    Liste des matières que vous enseignez
  </h2>

  <style>
    {`
      .card-responsive {
        flex: 1 1 calc(20% - 1rem);
        max-width: 20%;
        margin: 0.5rem;
        border-radius: 15px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        background-color: #ffffff; /* Couleur de fond des cartes */
        overflow: hidden;
      }

      .card-responsive:hover {
        transform: translateY(-10px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      .card-body {
        padding: 1.5rem;
        text-align: left;
      }

      /* Pour les écrans entre 768px et 1200px */
      @media (max-width: 1200px) {
        .card-responsive {
          flex: 1 1 calc(25% - 1rem);
          max-width: 25%;
        }
      }

      /* Pour les écrans entre 576px et 768px */
      @media (max-width: 768px) {
        .card-responsive {
          flex: 1 1 calc(40% - 1rem);
          max-width: 40%;
        }
      }

      /* Pour les écrans mobiles (moins de 576px) */
      @media (max-width: 576px) {
        .card-responsive {
          flex: 1 1 calc(90% - 1rem);
          max-width: 90%;
        }
      }

      .numbers p {
        color: #666;
        font-size: 0.875rem;
      }

      .numbers h5 {
        font-size: 1.25rem;
        font-weight: bold;
        color: #333;
      }

      .numbers p span {
        color: #4caf50;
        font-weight: bold;
      }

      .avatar {
        border-radius: 50%;
        width: 50px;
        height: 50px;
      }
    `}
  </style>

  {courses.map((course, index) => (
    <div className="card-responsive" key={index}>
      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-8">
              <div className="numbers">
                <p className="text-sm mb-0 text-uppercase font-weight-bold">
                  {course.name}
                </p>
                <h5 className="font-weight-bolder">
                  {course.duration} Heures au total
                </h5>
                <p className="mb-0">
                  <span className="text-success text-sm font-weight-bolder">
                    Module : {course.module.name}
                  </span>
                 
                </p>
              </div>
            </div>
            <div className="col-4 text-center">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/storage/${course.image}`}
                className="avatar avatar-sm me-3"
                alt={course.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>




  {/* Calendrier des événements Section */}
  <div className="row mt-4">
  <div className="row justify-content-center" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
  {/* Calendrier des événements */}
  <div className="col-10" style={{ flex: "0 0 auto", width: "calc(80.33333% - 1rem)" }}>
    <div className="card shadow-lg border-0 rounded-3 overflow-hidden" style={{ height: "100%" }}>
      <div className="card-header" style={{ backgroundColor: "#085a94" }}>
        <h3 className="mb-0 fw-bold text-white" style={{ fontSize: '1.25rem', textAlign: 'center' }}>
          Calendrier des événements
        </h3>
      </div>
      <div className="card-body p-3" style={{ backgroundColor: "#f1f3f5" }}>
        <div className="my-3 p-2 rounded-3" style={{ backgroundColor: "#ffffff", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{
              height: 350, // Réduction de la hauteur
              borderRadius: '12px',
              backgroundColor: 'white',
              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      </div>
    </div>
  </div>

  {/* Taux de liberté */}
  <div className="col-lg-2 mx-auto" style={{ flex: "0 0 auto", width: "calc(20.66667% - 1rem)" }}>
    <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ height: "100%" }}>
      <div className="card-header" style={{ backgroundColor: "#2bb99a" }}>
        <h5 className="mb-0 fs-4 fw-semibold text-white text-center">
          Taux de Liberté dans cette semaine
        </h5>
      </div>
      <div className="card-body p-5 d-flex justify-content-between align-items-stretch">
        <div className="d-flex justify-content-center align-items-center" style={{ flex: 1 }}>
          {/* Conteneur pour le donut */}
          <div className="position-relative" style={{ width: "200px", height: "200px" }}>
            <Doughnut
              data={freeTimeData}
              options={{
                ...freeTimeOptions,
                responsive: true,
                plugins: {
                  tooltip: {
                    enabled: true,
                  },
                },
                elements: {
                  arc: {
                    borderWidth: 5, // Bordure entre les segments
                    borderRadius: [10, 0, 10, 0], // Arrondir uniquement les jonctions des segments
                  },
                },
                cutout: "60%", // Taille du trou au centre du donut
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div className="mt-4">
  <div
    className="row flex-nowrap"
    style={{
      overflowX: "auto", // Active le défilement horizontal
      paddingBottom: "10px", // Optionnel, ajout d'un peu de marge pour un meilleur rendu
    }}
  >
    {/* Boucle sur les formations */}
    {formations.map((formation) => (
      <div key={formation.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}>
          <div
            className="card-header text-white text-center py-3"
            style={{
              backgroundColor: "#085a94",
              borderBottom: "4px solid #00aaff", // Ajout d'une ligne colorée en bas de l'entête
            }}
          >
           <h3 className="mb-0 fw-bold text-white" style={{ fontSize: '1.25rem', textAlign: 'center' }}>{formation.name}</h3>
          </div>

          <div className="card-body p-4" style={{ backgroundColor: "#f8f9fa" }}>
            {evaluationData[formation.id] && (
              <div className="chart-container" style={{ height: "220px" }}>
                <Bar data={evaluationData[formation.id]} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

{/* Styles CSS supplémentaires pour ajouter des animations et des hover effects */}
<style jsx>{`
  .card:hover {
    transform: translateY(-5px); /* Légère élévation lors du survol */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); /* Ombre plus marquée */
  }

  .card-header {
    background-color: #085a94;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1); /* Ombre douce sous l'en-tête */
  }

  .card-body {
    padding: 1.5rem;
    transition: background-color 0.3s ease;
  }

  .card-body:hover {
    background-color: #e9ecef; /* Changement de couleur lors du survol */
  }
`}</style>

  </div>
</div>



  );
};

export default Dashboard;
