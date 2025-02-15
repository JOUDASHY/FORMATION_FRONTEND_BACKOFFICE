import React from "react";
import logo from '../../assets/assets_landing/images/logo_unit.png';

const Partner = () => {
  return (
    <footer className="bg-dark text-light py-5">
      <div className="container">
        <div className="row text-center text-md-left">
          {/* Logo de l'Entreprise */}
          <div className="col-md-4 mb-4">
            <div className="d-flex flex-column align-items-center">
              <img src={logo} alt="Logo de l'entreprise" className="mb-3" style={{ width: '100px' }} />
              <p>Création digitale</p>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="col-md-4 mb-4">
            <h4 className="text-uppercase">Coordonnées</h4>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-phone-alt"></i> 
                <span className="ml-2">032 68 479 49</span>
                <small className="d-block">Mobile</small>
              </li>
              <li>
                <i className="fas fa-envelope"></i> 
                <span className="ml-2">
                  <a href="mailto:contact@unityfianar.site" className="text-light">contact@unityfianar.site</a>
                </span>
                <small className="d-block">E-mail</small>
              </li>
            </ul>
          </div>

          {/* Liens Sociaux */}
          <div className="col-md-4 mb-4">
            <h4 className="text-uppercase">Sites Web et réseaux sociaux</h4>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-globe"></i> 
                <a href="https://unityfianar.site/" target="_blank" rel="noopener noreferrer" className="ml-2 text-light">Site web</a>
              </li>
              <li>
                <i className="fab fa-linkedin"></i> 
                <a href="https://www.linkedin.com/company/90942101" target="_blank" rel="noopener noreferrer" className="ml-2 text-light">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bas */}
        <div className="text-center pt-3">
          <p className="mb-0">&copy; 2023 Unity Fianar. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Partner;
