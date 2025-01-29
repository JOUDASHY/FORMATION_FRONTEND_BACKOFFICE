import React, { useEffect, useState, useRef } from "react";
import axios from "axios"; // Assurez-vous que axios est installé
import { useNavigate } from 'react-router-dom'; // Importer useNavigate pour gérer la navigation
import Right from './Right';
import { Chart, registerables } from 'chart.js'; 
import axiosClient from "../../axiosClient";

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
    const [paidPercentage, setPaidPercentage] = useState(0);
    const [unpaidPercentage, setUnpaidPercentage] = useState(0);
    
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // Obtenir la date sous forme de chaîne
        setCurrentDate(formattedDate); // Mettre à jour l'état avec la date formatée
    
        const fetchData = async () => {
            try {
                // Récupérer les utilisateurs (apprenants)
                const studentsResponse = await axiosClient.get("/users");
                const apprenanteCount = studentsResponse.data.filter(user => user.type === 'apprenant').length;
                setTotalStudents(apprenanteCount);
    
                // Récupérer les paiements pour calculer le total payé
                const paiementsResponse = await axiosClient.get("/paiements");
                const paiements = paiementsResponse.data.results;
    
                const totalPaidAmount = paiements.reduce((total, paiement) => {
                    return total + (paiement.montant || 0);
                }, 0);
                setTotalPaid(totalPaidAmount);
    
                // Récupérer les inscriptions pour calculer le total impayé
                const inscriptionsResponse = await axiosClient.get("/inscriptions");
                const inscriptions = inscriptionsResponse.data.results;
    
                const totalUnpaidAmount = inscriptions.reduce((total, inscription) => {
                    const tariff = inscription.formations?.tariff || 0;
                    const payed = inscription.payed || 0;
                    const remaining = tariff - payed;
                    return total + (remaining > 0 ? remaining : 0);
                }, 0);
                setTotalUnpaid(totalUnpaidAmount);
    
                // Calculer le total dû
                const totalDueAmount = totalPaidAmount + totalUnpaidAmount;
                setTotalDue(totalDueAmount);
    
                // Calculer les pourcentages
                const paidPercentage = totalDueAmount > 0 ? (totalPaidAmount / totalDueAmount) * 100 : 0;
                const unpaidPercentage = totalDueAmount > 0 ? (totalUnpaidAmount / totalDueAmount) * 100 : 0;
                setPaidPercentage(paidPercentage);
                setUnpaidPercentage(unpaidPercentage);
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            } finally {
                setLoading(false); // Fin du chargement
            }
        };
    
        fetchData();
    }, []);
    
    useEffect(() => {
        const ctx = document.getElementById("chart-line").getContext("2d");

        // Vérifier si un graphique existe déjà et le détruire
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
        gradientStroke.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
        gradientStroke.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
        gradientStroke.addColorStop(0, 'rgba(94, 114, 228, 0)');
        
        chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: "Mobile apps",
                    tension: 0.4,
                    pointRadius: 0,
                    borderColor: "#5e72e4",
                    backgroundColor: gradientStroke,
                    borderWidth: 3,  // Gardez cette ligne
                    fill: true,
                    data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
                    maxBarThickness: 6
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                scales: {
                    y: {
                        grid: {
                            drawBorder: false,
                            display: true,
                            drawOnChartArea: true,
                            drawTicks: false,
                            borderDash: [5, 5]
                        },
                        ticks: {
                            display: true,
                            padding: 10,
                            color: '#fbfbfb',
                            font: {
                                size: 11,
                                family: "Open Sans",
                                style: 'normal',
                                lineHeight: 2
                            },
                        }
                    },
                    x: {
                        grid: {
                            drawBorder: false,
                            display: false,
                            drawOnChartArea: false,
                            drawTicks: false,
                            borderDash: [5, 5]
                        },
                        ticks: {
                            display: true,
                            color: '#ccc',
                            padding: 20,
                            font: {
                                size: 11,
                                family: "Open Sans",
                                style: 'normal',
                                lineHeight: 2
                            },
                        },
                    },
                },
            },
        });
        

    }, [totalStudents, totalPaid, totalUnpaid]); // Dépendances pour redessiner le graphique

    return (
        <div className="row">
            <div className="insights-container">
                <div className="insights">
                    <div className="sales">
                        <span className="material-symbols-outlined" aria-hidden="true">people</span>
                        <div className="middle">
                            <div className="lef">
                                <h3>Nombre Total d'Étudiants</h3>
                                <h1>{totalStudents}</h1>
                            </div>
                            <div className="progresss" role="progresssbar" aria-label="Progresss of total students">
                                <svg width="7rem" height="7rem">
                                    <circle cx="38" cy="38" r="36" className="sales-progresss-circle"></circle>
                                </svg>
                                <div className="number">
                                    <p>100%</p>
                                </div>
                            </div>
                        </div>
                        <small className="text-muted">Données par mois</small>
                    </div>

                    <div className="expenses">
    <span className="material-symbols-outlined" aria-hidden="true">payments</span>
    <div className="middle">
        <div className="lef">
            <h3>Total des Paiements Réussis</h3>
            <h1>{totalPaid} Ar</h1>
        </div>
        <div className="progresss" role="progressbar" aria-label="Progress of total payments">
            <svg width="7rem" height="7rem">
                <circle 
                    cx="38" 
                    cy="38" 
                    r="36" 
                    className="expenses-progresss-circle" 
                    style={{
                        strokeDasharray: 2 * Math.PI * 36,
                        strokeDashoffset: 2 * Math.PI * 36 * (1 - paidPercentage / 100),
                    }}
                ></circle>
            </svg>
            <div className="number">
                <p>{paidPercentage.toFixed(2)}%</p>
            </div>
        </div>
    </div>
    <small className="text-muted">Données par mois</small>
</div>

<div className="income">
    <span className="material-symbols-outlined" aria-hidden="true">attach_money</span>
    <div className="middle">
        <div className="lef">
            <h3>Total Non Payé</h3>
            <h1>{totalUnpaid} Ar</h1>
        </div>
        <div className="progresss" role="progressbar" aria-label="Progress of unpaid amount">
            <svg width="7rem" height="7rem">
                <circle 
                    cx="38" 
                    cy="38" 
                    r="36" 
                    className="income-progresss-circle" 
                    style={{
                        strokeDasharray: 2 * Math.PI * 36,
                        strokeDashoffset: 2 * Math.PI * 36 * (1 - unpaidPercentage / 100),
                    }}
                ></circle>
            </svg>
            <div className="number">
                <p>{unpaidPercentage.toFixed(2)}%</p>
            </div>
        </div>
    </div>
    <small className="text-muted">Données par mois</small>
</div>

                </div>
            </div>

            <div className="row mt-4">
                <div className="col-lg-7 mb-lg-0 mb-4">
                    <div className="card z-index-2 h-100">
                        <div className="card-header pb-0 pt-3 bg-transparent">
                            <h6 className="text-capitalize">Revenus générés</h6>
                            <p className="text-sm mb-0">
                                <i className="fa fa-arrow-up text-success" aria-hidden="true"></i>
                                <span className="font-weight-bold">{currentDate}</span>
                            </p>
                        </div>
                        <div className="card-body">
                            <canvas id="chart-line" height="300" width="600"></canvas>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <Right />
                </div>
            </div>
            
        </div>
    );
};

export default Dashboard;
