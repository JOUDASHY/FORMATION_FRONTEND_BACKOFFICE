import React, { useEffect } from 'react';
// import left from "../assets/images/about-left-image.jpg";
import apropos from "../../assets/assets_landing/images/apropos.png";
import service from "../../assets/assets_landing/images/service.png";

const About = () => {
  useEffect(() => {
    const Accordion = {
      settings: {
        first_expanded: false,
        toggle: false
      },

      openAccordion: function(toggle, content) {
        if (content.children.length) {
          toggle.classList.add("is-open");
          let final_height = Math.floor(content.children[0].offsetHeight);
          content.style.height = final_height + "px";
        }
      },

      closeAccordion: function(toggle, content) {
        toggle.classList.remove("is-open");
        content.style.height = 0;
      },

      init: function(el) {
        const _this = this;

        let is_first_expanded = _this.settings.first_expanded;
        if (el.classList.contains("is-first-expanded")) is_first_expanded = true;
        let is_toggle = _this.settings.toggle;
        if (el.classList.contains("is-toggle")) is_toggle = true;

        const sections = el.getElementsByClassName("accordion");
        const all_toggles = el.getElementsByClassName("accordion-head");
        const all_contents = el.getElementsByClassName("accordion-body");
        
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          const toggle = all_toggles[i];
          const content = all_contents[i];

          toggle.addEventListener("click", function(e) {
            if (!is_toggle) {
              for (let a = 0; a < all_contents.length; a++) {
                _this.closeAccordion(all_toggles[a], all_contents[a]);
              }
              _this.openAccordion(toggle, content);
            } else {
              if (toggle.classList.contains("is-open")) {
                _this.closeAccordion(toggle, content);
              } else {
                _this.openAccordion(toggle, content);
              }
            }
          });

          if (i === 0 && is_first_expanded) {
            _this.openAccordion(toggle, content);
          }
        }
      }
    };

    const accordions = document.getElementsByClassName("accordions");
    for (let i = 0; i < accordions.length; i++) {
      Accordion.init(accordions[i]);
    }
  }, []); // Le tableau vide [] signifie que l'effet ne s'exécute qu'au montage.

  return (
    <>
      {/* Page Heading */}
      <div className="page-heading">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="header-text">
                <h2>À propos de nous</h2>
                <div className="div-dec"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Section */}
      <section className="top-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="left-image">
                <img src={apropos} alt="À propos" />
              </div>
            </div>
            <div className="col-lg-6 align-self-center">
              <div className="accordions is-first-expanded">
                {/* Accordions here */}
                <article className="accordion">
                  <div className="accordion-head">
                    <span>Formations en Informatique</span>
                    <span className="icon">
                      <i className="icon fa fa-chevron-right"></i>
                    </span>
                  </div>
                  <div className="accordion-body">
                    <div className="content">
                      <p>
                      Nous proposons des formations de qualité en informatique, adaptées aux besoins des débutants comme des professionnels. Que vous souhaitiez apprendre à coder, maîtriser la bureautique ou approfondir vos compétences en administration réseau, nos formations sont conçues pour vous offrir les meilleures opportunités sur le marché du travail.
                      </p>
                    </div>
                  </div>
                </article>
                <article className="accordion">
                  <div className="accordion-head">
                    <span>Certifications Reconnues</span>
                    <span className="icon">
                      <i className="icon fa fa-chevron-right"></i>
                    </span>
                  </div>
                  <div className="accordion-body">
                    <div className="content">
                      <p>
                      À la fin de chaque formation, vous obtenez une certification reconnue qui atteste de vos compétences. Nos programmes sont accrédités et respectent les standards internationaux pour vous aider à vous démarquer sur le marché de l'emploi.
                      </p>
                    </div>
                  </div>
                </article>
                <article className="accordion">
                  <div className="accordion-head">
                    <span>Basé à Fianarantsoa</span>
                    <span className="icon">
                      <i className="icon fa fa-chevron-right"></i>
                    </span>
                  </div>
                  <div className="accordion-body">
                    <div className="content">
                      <p>
                      Situé à Fianarantsoa, notre centre de formation bénéficie d'un environnement propice à l'apprentissage, avec des formateurs expérimentés et des équipements modernes. Nous accueillons des étudiants de toute la région pour leur offrir un avenir professionnel prometteur dans le domaine de l'informatique.
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="simple-cta">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <h4>Solutions <em>Professionnelles</em> et <em>Certifications</em> en Informatique</h4>
            </div>
            <div className="col-lg-7">
              <div className="buttons">
                <div className="green-button">
                  <a href="#">En savoir plus</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="what-we-do">
        <div className="container">
        <div className="row">
            <div className="col-lg-5">
              <div className="left-content">
                <h4>Parlez-nous de vos objectifs et comment nous pouvons vous aider à les atteindre</h4>
                <p>
                  Nous offrons un large éventail de formations, que ce soit pour améliorer vos compétences en développement web, en réseaux ou dans les logiciels de bureautique. N'hésitez pas à nous contacter pour en savoir plus sur nos programmes et comment ils peuvent correspondre à vos besoins professionnels.
                </p>
                <div className="green-button">
                  <a href="contact-us.html">En savoir plus</a>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="right-items">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="item">
                      <em>01</em>
                      <h4>Première Étape</h4>
                      <p>Inscrivez-vous à l'une de nos formations pour débuter votre parcours en informatique.</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="item">
                      <em>02</em>
                      <h4>Deuxième Étape</h4>
                      <p>Suivez des cours théoriques et pratiques, adaptés à votre niveau et vos objectifs.</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="item">
                      <em>03</em>
                      <h4>Troisième Étape</h4>
                      <p>Réalisez des projets concrets pour mettre en pratique vos nouvelles compétences.</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="item">
                      <em>04</em>
                      <h4>Quatrième Étape</h4>
                      <p>Obtenez votre certification et accédez à de nouvelles opportunités professionnelles.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Simple CTA Section with "Nos autres services" */}
<section className="simple-cta">
  <div className="container">
    <div className="row">
      <div className="col-lg-5">
        <h4>Nos <em>Autres Services</em> en Informatique</h4>
        <p>
          En plus de nos formations, nous proposons une gamme complète de services dans le domaine de l'informatique. 
          Que vous ayez besoin de solutions de développement web, d'applications mobiles sur mesure, ou de conseils en IT, 
          notre équipe d'experts est là pour vous accompagner dans la réalisation de vos projets.
        </p>
      </div>
      <div className="col-lg-7">
        <div className="buttons">
          <div className="green-button">
            <a href="https://unityfianar.site/">En savoir plus</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      <section className="top-section">
  <div className="container">
    <div className="row">
      <div className="col-lg-6">
        <div className="left-image">
          <img 
            src={service} 
            alt="Nos autres services" 
          />
        </div>
      </div>
      <div className="col-lg-6 align-self-center">
        <div className="accordions is-first-expanded">
          {/* Accordions here */}
          <article className="accordion">
            <div className="accordion-head">
              <span>Développement d'Applications</span>
              <span className="icon">
                <i className="icon fa fa-chevron-right"></i>
              </span>
            </div>
            <div className="accordion-body">
              <div className="content">
                <p>
                  Nous proposons des services de développement d'applications mobiles et web sur mesure, adaptés à vos besoins spécifiques. Que vous ayez un projet de gestion d'entreprise, une application e-commerce, ou tout autre type d'application, notre équipe de développeurs qualifiés saura vous accompagner tout au long du processus.
                </p>
              </div>
            </div>
          </article>
          <article className="accordion">
            <div className="accordion-head">
              <span>Développement Web</span>
              <span className="icon">
                <i className="icon fa fa-chevron-right"></i>
              </span>
            </div>
            <div className="accordion-body">
              <div className="content">
                <p>
                  Nous créons des sites web dynamiques, réactifs et optimisés. Que ce soit pour une vitrine en ligne, une plateforme d'e-learning ou une application web, nous garantissons des solutions web performantes et sécurisées.
                </p>
              </div>
            </div>
          </article>
          <article className="accordion">
            <div className="accordion-head">
              <span>Consultation et Audit</span>
              <span className="icon">
                <i className="icon fa fa-chevron-right"></i>
              </span>
            </div>
            <div className="accordion-body">
              <div className="content">
                <p>
                  Nous offrons des services de consultation pour vous aider à optimiser vos infrastructures IT, ainsi que des audits pour évaluer la sécurité, la performance et l'efficacité de vos systèmes existants.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</section>

    </>
  );
};

export default About;
