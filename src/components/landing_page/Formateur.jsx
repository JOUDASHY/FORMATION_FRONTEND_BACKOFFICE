import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Formateur = () => {
    const [formateurs, setFormateurs] = useState([]);

    // Appel API pour récupérer les formateurs
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users`)
        .then(response => {
            // Filtrer les utilisateurs pour ne récupérer que ceux ayant le type 'formateur'
            const onlyFormateurs = response.data.filter(user => user.type === 'formateur');
            setFormateurs(onlyFormateurs);
        })
        .catch(error => {
            console.error("Il y a une erreur lors de la récupération des formateurs : ", error);
        });
    }, []);

    return (
     <>
           {/* Page Heading */}
           <div className="page-heading">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="header-text">
                <h2>Nos formateurs</h2>
                <div className="div-dec"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
  <div className="text-center mx-auto mb-5" style={{ maxWidth: '600px' }}>
    <h1 className="display-5 text-uppercase mb-4">
      Nous sommes des <span className="text-primary">experts en formation informatique</span>
    </h1>
  </div>
  <div className="row g-4">
    {formateurs.map((formateur, index) => (
      <div key={index} className="col-xl-3 col-lg-4 col-md-6 col-6">
        <div
          className="card shadow-lg rounded"
          style={{
            overflow: "hidden",
            border: "none",
            transition: "transform 0.3s",

          }}
        >
          {/* Image du formateur */}
          <div className="position-relative" style={{ height: "250px" }}>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${formateur.image}`}
              alt={formateur.name}
              className="w-100 h-100"
              style={{
                objectFit: "cover",
                filter: "grayscale(20%)",
                transition: "filter 0.3s, transform 0.3s",
              }}
            />
          </div>

          {/* Informations */}
          <div className="card-body text-center p-4">
            <h5 className="text-uppercase mb-3">{formateur.name}</h5>
            <p className="text-muted">Cours enseignés :</p>
            {formateur.courses && formateur.courses.length > 0 ? (
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {formateur.courses.map((course, idx) => (
                  <span
                    key={idx}
                    className="badge bg-primary text-white rounded-pill"
                  >
                    {course.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted">Aucun cours disponible</p>
            )}
          </div>

          {/* Réseaux sociaux */}
          <div className="card-footer bg-light d-flex justify-content-center gap-3 py-3">
            {formateur.facebook_link && (
              <a href={formateur.facebook_link} className="btn btn-outline-primary btn-sm rounded-circle">
                <i className="fab fa-facebook-f"></i>
              </a>
            )}
            {formateur.linkedin_link && (
              <a href={formateur.linkedin_link} className="btn btn-outline-primary btn-sm rounded-circle">
                <i className="fab fa-linkedin-in"></i>
              </a>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

        </>
    );
};

export default Formateur;
