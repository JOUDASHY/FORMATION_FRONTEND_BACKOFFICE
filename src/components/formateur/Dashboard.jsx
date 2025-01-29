import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axiosClient from "../../axiosClient";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [freeTimePercentage, setFreeTimePercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [planningData, setPlanningData] = useState([]);

  useEffect(() => {
    const fetchPlanningData = async () => {
      try {
        const response = await axiosClient.get("/Planning_formateur");
        const data = response.data; // Données de planning récupérées
        
        setPlanningData(data); // Sauvegarder les données pour déboguer

        console.log("Planning Data:", data);

        // Règle : Si le formateur a 20 plannings ou plus, taux de liberté = 0%
        if (data.length >= 20) {
          console.log("Le formateur a 20 plannings ou plus.");
          setFreeTimePercentage(0);
          setLoading(false);
          return;
        }

        // Calculer le pourcentage de temps libre basé sur le nombre de plannings
        const occupiedPercentage = (data.length / 20) * 100; // Chaque planning représente 5% (100% / 20)
        const freePercentage = 100 - occupiedPercentage; // Temps libre = 100% - Temps occupé

        console.log("Taux de liberté calculé:", freePercentage);

        setFreeTimePercentage(freePercentage.toFixed(2)); // Fixer à 2 décimales
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du planning :", error);
        setLoading(false);
      }
    };

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

  const data = {
    labels: ["Temps libre (%)", "Temps occupé (%)"],
    datasets: [
      {
        data: [freeTimePercentage, 100 - freeTimePercentage],
        backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: "75%", // Créer l'effet de jauge
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`,
        },
      },
    },
  };

  return (
    <div className="container py-4">
      <h3 className="text-center">Taux de Liberté par Semaine</h3>
      <div className="d-flex justify-content-center">
        <div style={{ width: "300px" }}>
          <Doughnut data={data} options={options} />
        </div>
      </div>
      <div className="text-center mt-3">
        <p>
          <strong>Temps libre :</strong> {freeTimePercentage}%
        </p>
        <p>
          <strong>Temps occupé :</strong> {(100 - freeTimePercentage).toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
