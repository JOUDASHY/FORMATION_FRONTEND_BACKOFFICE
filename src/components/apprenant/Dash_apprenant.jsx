import React, { useEffect, useState, useRef } from "react";
import axios from "axios"; // Assurez-vous que axios est installé
import { useNavigate } from 'react-router-dom'; // Importer useNavigate pour gérer la navigation
// import Right from './Right';
import { Chart, registerables } from 'chart.js'; 
import axiosClient from "../../axiosClient";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Enregistrement des éléments de Chart.js
Chart.register(...registerables);

const Dashboard = ({ user }) => {
    const navigate = useNavigate(); // Initialiser useNavigate
    const chartRef = useRef(null); // Référence pour le graphique

    const [totalStudents, setTotalStudents] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalUnpaid, setTotalUnpaid] = useState(0);
    const [loading, setLoading] = useState(true); // État de chargement
    const [currentDate, setCurrentDate] = useState(""); // État pour la date actuelle
    const [totalDue, setTotalDue] = useState(0); // Montant total dû

    useEffect(() => {
        // Récupération de la date d'aujourd'hui
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // Obtenir la date sous forme de chaîne
        setCurrentDate(formattedDate); // Mettre à jour l'état avec la date formatée
     

    
    }, []);
    const [evaluations, setEvaluations] = useState([]);

    // Récupérer les évaluations de l'apprenant depuis l'API
    useEffect(() => {
      axiosClient.get("/evaluations/apprenant")
        .then(response => {
          setEvaluations(response.data);
        })
        .catch(error => {
          console.error("Il y a eu une erreur lors de la récupération des évaluations :", error);
        });
    }, []);
 



    const [inscription, setinscription] = useState([]);

    useEffect(() => {
      // Fetch data from API
      axiosClient
        .get("/apprenant_inscription")
        .then((response) => {
          setinscription(response.data.results);
        })
        .catch((error) => {
          console.error("Error fetching inscription", error);
        });
    }, []);



    useEffect(() => {
        // const ctx = document.getElementById("chart-line").getContext("2d");

        // Vérifier si un graphique existe déjà et le détruire
        // if (chartRef.current) {
        //     chartRef.current.destroy();
        // }

        // const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
        // gradientStroke.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
        // gradientStroke.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
        // gradientStroke.addColorStop(0, 'rgba(94, 114, 228, 0)');

        // chartRef.current = new Chart(ctx, {
        //     type: "line",
        //     data: {
        //         labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        //         datasets: [{
        //             label: "Mobile apps",
        //             tension: 0.4,
        //             borderWidth: 0,
        //             pointRadius: 0,
        //             borderColor: "#5e72e4",
        //             backgroundColor: gradientStroke,
        //             borderWidth: 3,
        //             fill: true,
        //             data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
        //             maxBarThickness: 6
        //         }],
        //     },
        //     options: {
        //         responsive: true,
        //         maintainAspectRatio: false,
        //         plugins: {
        //             legend: {
        //                 display: false,
        //             }
        //         },
        //         interaction: {
        //             intersect: false,
        //             mode: 'index',
        //         },
        //         scales: {
        //             y: {
        //                 grid: {
        //                     drawBorder: false,
        //                     display: true,
        //                     drawOnChartArea: true,
        //                     drawTicks: false,
        //                     borderDash: [5, 5]
        //                 },
        //                 ticks: {
        //                     display: true,
        //                     padding: 10,
        //                     color: '#fbfbfb',
        //                     font: {
        //                         size: 11,
        //                         family: "Open Sans",
        //                         style: 'normal',
        //                         lineHeight: 2
        //                     },
        //                 }
        //             },
        //             x: {
        //                 grid: {
        //                     drawBorder: false,
        //                     display: false,
        //                     drawOnChartArea: false,
        //                     drawTicks: false,
        //                     borderDash: [5, 5]
        //                 },
        //                 ticks: {
        //                     display: true,
        //                     color: '#ccc',
        //                     padding: 20,
        //                     font: {
        //                         size: 11,
        //                         family: "Open Sans",
        //                         style: 'normal',
        //                         lineHeight: 2
        //                     },
        //                 },
        //             },
        //         },
        //     },
        // });

    }, [totalStudents, totalPaid, totalUnpaid]); // Dépendances pour redessiner le graphique
    const [events, setEvents] = useState([]);
    const localizer = momentLocalizer(moment);
  
    useEffect(() => {
      // Transformer vos données globalEvents pour le calendrier
      const transformGlobalEvents = () => {
        const globalEvents = {
          Janvier: [{ date: "2024-01-01", description: "Nouvel An (Jour férié mondial)" }],
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
          Novembre: [{ date: "2024-11-01", description: "Fête de la Mort" }],
          Décembre: [
            { date: "2024-12-10", description: "Journée des droits de l’homme" },
            { date: "2024-12-24", description: "Veillée de Noël" },
            { date: "2024-12-25", description: "Noël" },
          ],
        };
  
        const transformedEvents = Object.keys(globalEvents).flatMap((month) =>
          globalEvents[month].map((event) => ({
            title: event.description,
            start: new Date(event.date),
            end: new Date(event.date),
          }))
        );
        setEvents(transformedEvents);
      };
  
      transformGlobalEvents();
    }, []);
    return (
        <div className="row">


            <div className="row mt-4">
            <div className="col-lg-7 mb-lg-0 mb-0 border-0" style={{ borderRadius: '15px' }}>
        <div className="card-header" style={{ backgroundColor: "#085a94" }}>
          <h3 className="mb-0 fw-bold text-white" style={{ fontSize: "1.25rem", textAlign: "center" }}>
            Calendrier des événements
          </h3>
        </div>
        <div className="card-body p-3" style={{ backgroundColor: "#f1f3f5" }}>
          <div
            className="my-3 p-2 rounded-3"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{
                height: 350,
                borderRadius: "12px",
                backgroundColor: "white",
                boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        </div>
      </div>

                <div className="col-lg-5">
  <div className="card">
    <div className="card-header pb-0 p-3">
      <div className="d-flex justify-content-between">
        <h6 className="mb-2">Progression par Formation</h6>
      </div>
    </div>
    <div className="table-responsive">
      <table className="table align-items-center">
        <tbody>
          {evaluations.map((evaluation) => {
            // Calculer le pourcentage en fonction de la note (sur 20)
            const percentage = (evaluation.note / 20) * 100;

            return (
              <tr key={evaluation.id}>
                <td className="w-30">
                  <div className="d-flex px-2 py-1 align-items-center">
                    <div>
                      {/* <img
                        src={`../assets/img/icons/flags/${evaluation.formation.image}`}
                        alt="Formation Image"
                      /> */}
                              <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${evaluation.course.image}`} className="avatar avatar-sm me-3"  />

                    </div>
                    <div className="ms-4">
                      <p className="text-xs font-weight-bold mb-0">Formation:</p>
                      <h6 className="text-sm mb-0">{evaluation.formation.name}</h6>
                    </div>
                  </div>
                </td>
                <td className="w-30">
                  <div className="d-flex px-2 py-1 align-items-center">
                    <div>
                      <p className="text-xs font-weight-bold mb-0">Cours:</p>
                      <h6 className="text-sm mb-0">{evaluation.course.name}</h6>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="text-center">
                    <p className="text-xs font-weight-bold mb-0">Note:</p>
                    <h6 className="text-sm mb-0">{evaluation.note}/20</h6>
                  </div>
                </td>
                <td className="align-middle text-sm">
                  <div className="col text-center">
                    <p className="text-xs font-weight-bold mb-0">Progression:</p>
                    <h6 className="text-sm mb-0">{percentage.toFixed(2)}%</h6>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
</div>



            </div>

            <div className="container-fluid py-4">
      <div className="card h-100 mb-4">
        <div className="card-header pb-0 px-3">
          <div className="row">
            <div className="col-md-6">
              <h6 className="mb-0">Paiement des formations</h6>
            </div>
            <div className="col-md-6 d-flex justify-content-end align-items-center">
              <i className="far fa-calendar-alt me-2"></i>
              <small>2023-2024</small>
            </div>
          </div>
        </div>
        <div className="card-body pt-4 p-3">
          <h6 className="text-uppercase text-body text-xs font-weight-bolder mb-3">Mes Formations</h6>
          <ul className="list-group">
            {inscription.map((transaction) => {
              const isPaymentPaid = transaction.payment_state === "payée";
              return (
                <li key={transaction.id} className="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                  <div className="d-flex align-items-center">
              
                    <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${transaction.formations.image}`} className="avatar avatar-sm me-3"  />

                    <div className="d-flex flex-column">
                      <h6 className="mb-1 text-dark text-sm">{transaction.formations.name}</h6>

                      <span className="text-xs">{transaction.inscription_date}, at {new Date(transaction.created_at).toLocaleTimeString()}</span>
                    </div>
                    
                  </div>
                  <div className="d-flex align-items-center text-sm font-weight-bold">
                  <div className="d-flex align-items-center text-sm font-weight-bold">
  {isPaymentPaid ? (
    <span className="text-success text-gradient">
      + Ar{transaction.payed}
    </span>
  ) : (
    <span className="text-danger text-gradient">
      Ar{transaction.payed} ({((transaction.payed / transaction.formations.tariff) * 100).toFixed(2)}% payé)
   
      (Reste : Ar{transaction.formations.tariff - transaction.payed})
    </span>
  )}
</div>

                  </div>
                  <button className={`btn btn-icon-only btn-rounded mb-0 me-3 btn-sm d-flex align-items-center justify-content-center ${isPaymentPaid ? "btn-outline-success" : "btn-outline-danger"}`}>
                      <i className={`fas ${isPaymentPaid ? "fa-arrow-up" : "fa-arrow-down"}`}></i>
                    </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
        </div>
    );
};

export default Dashboard;
