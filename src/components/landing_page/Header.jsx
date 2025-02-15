import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/assets_landing/images/logo_unit.png';
import $ from 'jquery';  // Importer jQuery

const Header = () => {
    const [scrolled, setScrolled] = useState(false); // État pour savoir si l'utilisateur a défilé

    useEffect(() => {
        // Gestion de l'événement de défilement
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolled(true); // Si l'utilisateur a défilé, on met à jour l'état
            } else {
                setScrolled(false); // Si l'utilisateur est en haut de la page
            }
        };

        window.addEventListener('scroll', handleScroll); // Ajouter l'événement de défilement
        return () => {
            window.removeEventListener('scroll', handleScroll); // Nettoyage de l'événement
        };
    }, []);

    useEffect(() => {
        // Code JavaScript à exécuter une fois le composant monté

        // Menu Dropdown Toggle
        $('.menu-trigger').on('click', function() {	
            $(this).toggleClass('active');
            $('.header-area .nav').slideToggle(200);
        });

        // Fermer le menu après un clic sur un élément de la liste
        $('.nav li a').on('click', function() {
            if ($(window).width() <= 768) {  // Vérifier si l'écran est mobile
                $('.menu-trigger').removeClass('active');  // Cacher le menu
                $('.header-area .nav').slideUp(200);  // Fermer le menu
            }
        });

        // Animation de défilement
        $(document).on("click", ".scroll-to-section a[href^='#']", function (e) {
            e.preventDefault();
            const target = this.hash;
            const targetElement = $(target);
            $('html, body').animate({
                scrollTop: targetElement.offset().top - 79
            }, 500);
        });

        // Autres animations et initialisations peuvent être ajoutées ici

        return () => {
            // Nettoyage lors du démontage du composant
            $('.menu-trigger').off('click');
            $(document).off("click", ".scroll-to-section a[href^='#']");
            $('.nav li a').off('click'); // Nettoyer l'événement du clic
        };
    }, []);

    // Construction de l'URL avec la variable d'environnement
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    return (
        <header className="header-area header-sticky">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="main-nav">
                            <a href="index.html" className={`logo ${scrolled ? 'sticky-logo-left' : ''}`}>
                                <img src={logo} alt="Logo" style={{ width: '80px', height: '60px' }} /> 
                            </a>
                            <ul className="nav">
                                <li className="scroll-to-section">
                                    <NavLink exact to="/" activeClassName="active">Home</NavLink>
                                </li>
                                <li className="scroll-to-section">
                                    <NavLink to="/Module_list_page" activeClassName="active">Nos modules</NavLink>
                                </li>
                                <li className="scroll-to-section">
                                    <NavLink to="/About" activeClassName="active">À propos</NavLink>
                                </li>
                                <li className="scroll-to-section">
                                    <NavLink to="/Formateur" activeClassName="active">Formateur</NavLink>
                                </li>
                                <li className="scroll-to-section">
                                    <NavLink to="/Formtion_list_page" activeClassName="active">Formations</NavLink>
                                </li>
                                <li className="scroll-to-section">
                                    <NavLink to="/Contact" activeClassName="active">Contact</NavLink>
                                </li>
                                <li className="nav-item">
                <NavLink to="/register" className="nav-link" activeClassName="active">
                  <i className="fas fa-user-plus"></i> S'inscrire
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/login" className="nav-link" activeClassName="active">
                  <i className="fas fa-sign-in-alt"></i> Se connecter
                </NavLink>
              </li>
                            </ul>
                            <a className="menu-trigger">
                                <span>Menu</span>
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
