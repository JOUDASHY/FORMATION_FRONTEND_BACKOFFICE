import React from "react";
import logo from '../../assets/assets_landing/images/logo_unit.png';

const Footer = () => {
  return (
    <footer className="text-light py-5 my-5">
       <div className="container">
       <div className="row">
          
          {/* Logo et Nom de l'Entreprise */}
          <div className="col-md-4 mb-4">
            <div className="d-flex flex-column align-items-center">
              <img src={logo} alt="Logo de l'entreprise" className="mb-3" style={{ width: '100px' }} />
              <p>Centre de Formation Informatique</p>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase text-success">Coordonnées</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-phone-alt"></i> 
                <span className="ml-2 ms-2">+261349303649</span><br />
                <i className="fas fa-phone-alt"></i> 
                <span className="ml-2 ms-2 ">+261349303552</span>
                {/* <small className="d-block">Mobile</small> */}
              </li>
              <li>
                <i className="fas fa-envelope"></i> 
                <span className="ml-2  ms-2">
                  <a href="mailto:contact@unityfianar.site" className="text-light">contact@unityfianar.site</a>
                </span>
                <br />
                <i className="fas fa-envelope"></i> 
                <span className="ml-2  ms-2">
                  <a href="mailto:unitfianar@gmail.com" className="text-light">unitfianar@gmail.com</a>
                </span>
                {/* <small className="d-block">E-mail</small> */}
              </li>
            </ul>
          </div>

          {/* Liens Sociaux */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase text-success">Sites Web et réseaux sociaux</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-globe"></i> 
                <a href="https://unityfianar.site/" target="_blank" rel="noopener noreferrer" className="ml-2 text-light  ms-2" >Site web</a>
              </li>
              <li>
                <i className="fab fa-linkedin"></i> 
                <a href="https://mg.linkedin.com/company/un-it-company" target="_blank" rel="noopener noreferrer" className="ml-2 text-light  ms-2">LinkedIn</a>
              </li>
              <li>
                <i className="fab fa-facebook"></i> 
                <a href="https://web.facebook.com/profile.php?id=100078426131649" target="_blank" rel="noopener noreferrer" className="ml-2 text-light  ms-2">Facebook</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mention de droits d'auteur */}
        <div className="text-center pt-0">
          <p className="mb-0">
            &copy; 2024 Centre de Formation Informatique, Fianarantsoa. Tous droits réservés.
            <br />
            Conçu par <a href="#" className="text-light">xxxxxxxxxxxx</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
