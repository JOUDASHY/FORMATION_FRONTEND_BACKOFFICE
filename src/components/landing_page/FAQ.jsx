import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Comment s'inscrire à une formation ?",
      answer: "Pour vous inscrire, cliquez sur le bouton 'S'inscrire' situé à côté de la formation de votre choix. Suivez ensuite les étapes pour remplir vos informations et finaliser l'inscription."
    },
    {
      question: "Quels sont les modes de paiement disponibles ?",
      answer: "Nous acceptons les paiements par carte bancaire. Vous pouvez également effectuer un acompte et finaliser le paiement avant le début de la formation."
    },
    {
      question: "Comment obtenir une certification après une formation ?",
      answer: "Une fois la formation complétée et tous les examens réussis, vous recevrez automatiquement votre certificat téléchargeable depuis votre compte."
    },
    {
      question: "Les formations sont-elles reconnues par les employeurs ?",
      answer: "Oui, nos certifications sont accréditées par plusieurs organisations professionnelles, ce qui renforce leur reconnaissance sur le marché du travail."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="faq-section container my-5 p-4 rounded" style={{ backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 className="text-center mb-5" style={{ color: '#007bff', fontWeight: 'bold' }}>Questions Fréquemment Posées</h2>
      <div className="custom-accordion">
        {faqs.map((faq, index) => (
          <div className="faq-item mb-3" key={index}>
            <button
              className={`faq-question d-flex align-items-center ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
              style={{
                backgroundColor: activeIndex === index ? '#007bff' : '#ffffff',
                color: activeIndex === index ? '#ffffff' : '#333',
                fontWeight: 'bold',
                border: '1px solid #ddd',
                width: '100%',
                padding: '10px',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            >
              <i className="fas fa-question-circle me-2"></i>
              {faq.question}
              <i className={`fas fa-chevron-down ms-auto ${activeIndex === index ? 'rotate-icon' : ''}`} style={{ transition: 'transform 0.3s' }}></i>
            </button>
            {activeIndex === index && (
              <div className="faq-answer p-3" style={{ backgroundColor: '#f0f8ff', color: '#555', lineHeight: '1.6', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 5px 5px' }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
