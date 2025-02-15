import React from 'react';
import { Link } from 'react-router-dom'; // Importation du Link
import slide1 from "../../assets/assets_landing/images/slide-01.jpg"; // Vérifiez l'extension .jpg
// import slide2 from "../assets/images/slide-02.jpg";
// import slide3 from "../assets/images/slide-03.jpg";

const Slider = () => {
    return (
        <div className="swiper-container" id="top">
            <div className="swiper-wrapper">
                <div className="swiper-slide">
                    <div className="slide-inner" style={{ backgroundImage: `url(${slide1})` }}>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8">
                                    <div className="header-text">
                                        <h2>
                                            Préparez-vous pour <em>votre carrière en informatique</em><br />&amp; améliorez <em>vos compétences</em>
                                        </h2>
                                        <div className="div-dec"></div>
                                        <p>
                                            Rejoignez notre plateforme de formation à l'UN-IT Fianarantsoa et explorez des domaines clés comme la programmation, le développement web, la cybersécurité et l'intelligence artificielle. Nos cours sont conçus pour vous préparer aux défis du secteur technologique.
                                        </p>
                                        <div className="buttons">
                                            <div className="green-button">
                                                <Link to="/Contact">Contactez-nous</Link> {/* Utilisation de Link ici */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Slider;
