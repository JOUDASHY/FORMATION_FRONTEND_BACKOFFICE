import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
const Module_list = () => {
    const [formations, setFormations] = useState([]);
    const [modules, setModules] = useState({});

    // Récupération des formations
    useEffect(() => {
        const fetchFormations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/formations`); // Assurez-vous que l'URL est correcte
                setFormations(response.data.results); // Supposons que les résultats soient dans `data.results`
            } catch (error) {
                console.error('Erreur lors de la récupération des formations:', error);
            }
        };

        fetchFormations();
    }, []);

    // Récupération des modules après avoir récupéré les formations
    useEffect(() => {
        const fetchModules = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/modules`); // Assurez-vous que l'URL est correcte
                const modulesData = response.data.results.reduce((acc, module) => {
                    if (!acc[module.formation_id]) {
                        acc[module.formation_id] = [];
                    }
                    acc[module.formation_id].push(module);
                    return acc;
                }, {});
                setModules(modulesData);
            } catch (error) {
                console.error('Erreur lors de la récupération des modules:', error);
            }
        };

        fetchModules();
    }, []);

    return (
        <section className="about-us" id="about">
            <div className="container">
                <div className="row">
                    <div className="col-lg-10">
                        <div className="section-heading">
                        
                        <h4>Formations en Informatique chez UN-IT Fianarantsoa</h4>
                            <p>
                                À UN-IT Fianarantsoa, nous proposons des formations en informatique qui comprennent divers modules enrichissants. À la fin de chaque formation, une certification est délivrée, attestant de vos compétences et de votre expertise.
                                <br /><br />
                                Nos formations sont conçues pour répondre aux besoins du marché et vous préparer à exceller dans le domaine de l'informatique. Que vous soyez débutant ou que vous cherchiez à approfondir vos connaissances, nous avons le programme qu'il vous faut.
                            </p>
                            <div className="green-button">
                                <Link to="/About">Découvrez à propos de nous</Link>
                            </div>
                        </div>
                    </div>
  
                </div>
            </div>
        </section>
    );
};

export default Module_list;
