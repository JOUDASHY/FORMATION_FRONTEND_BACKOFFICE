import React ,{useState}from "react";
import Modal from 'react-modal';
import html2canvas from 'html2canvas';
import certificatLogo from '../../assets/img/logo_unit.png';  // Remplacer par le chemin correct de l'image
import { ClipLoader } from 'react-spinners';
function CertificationModal({ isOpen, onRequestClose, certificateData }) {
    const { userName, formationName, obtentionDate,modules } = certificateData || {};
    const [loading, setLoading] = useState(false); // État pour le spinner

    const handlePrint = () => {
        setLoading(true); // Afficher le spinner
  
        const certificateElement = document.getElementById("certificate-to-print");
    
        // Augmenter l'échelle pour une meilleure résolution ou réduire selon la taille du contenu
        html2canvas(certificateElement, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 1.0); // Image de haute qualité
            const pdfWidth = 297; // Largeur en mm pour un format A4
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Calculer la hauteur en fonction du ratio
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <html>
                    <head>
                        <title>Impression du Certificat</title>
                        <style>
                            @media print {
                                @page {
                                    size: A4 landscape;
                                    margin: 0;
                                }
                                body {
                                    margin: 0;
                                    padding: 0;
                                    background: white;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: auto;
                                }
                                img {
                                    width: 100%;
                                    height: auto;
                                }
                            }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        <img src="${imgData}" />
                    </body>
                </html>
            `);
            newWindow.document.close();
        });
      setLoading(false); // Masquer le spinner

    };
    

    const modalStyles = {
        content: {
            width: '100%',  // Utilisation d'une largeur relative
            maxWidth: '1200px',  // Limite la largeur maximale
            height: 'auto',  // Laissez la hauteur s'adapter au contenu
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            border: 'none',
            borderRadius: '10px',
            overflow: 'auto',  // Permet le défilement si nécessaire
          
        },
        overlay: {
            // backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backgroundColor: 'rgba(0, 0, 0, 0.75)', // Fond sombre et flou
            backdropFilter: 'blur(10px)', // Applique un effet de flou
            zIndex: 9999, 
        },
    };
    
    const certificateStyles = {
        container: {
            width: '297mm',  // Taille A4 en largeur
            height: 'auto',  // Taille A4 en hauteur
            padding: '0mm',  // Réduit un peu les marges internes pour plus de place
            backgroundColor: '#ffffff',
            border: '14px solid #085a94',
            borderRadius: '20px',
            boxShadow: '0 0 25px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontSize: '1em',  // Définition d'une taille de texte plus petite
        },
        logo: {
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '80px',  // Réduction de la taille du logo pour éviter un débordement
        },
        icon: {
            fontSize: '3em',  // Réduction de la taille de l'icône
            color: '#FFD700',
            marginBottom: '10px',
        },
        header: {
            fontSize: '2.5em',  // Réduction de la taille du titre principal
            color: '#085a94',
            fontFamily: 'Times New Roman, serif',
            margin: '5px 0',
            textTransform: 'uppercase',
            letterSpacing: '4px',
        },
        slogan: {
            fontSize: '1.1em',  // Ajustement de la taille de la citation
            color: '#555',
            marginBottom: '5px',
            fontStyle: 'italic',
        },
        name: {
            fontSize: '2.2em',  // Réduction de la taille du nom pour s'ajuster
            fontWeight: 'bold',
            color: '#085a94',
            margin: '5px 0',
        },
        course: {
            fontSize: '1.4em',  // Réduction de la taille du nom du cours
            color: '#2bb99a',
            fontStyle: 'italic',
        },
        separator: {
            width: '60%',
            height: '3px',
            background: '#085a94',
            margin: '5px auto',
        },
        footer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '30px',
            width: '100%',
            padding: '0 60px',
        },
        content :{
            fontSize: '1.4em',
            color: '#555555',
            lineHeight: '1.6em',
            margin: '15px 0',
            fontFamily: 'Arial',
        },
        signature: {
            textAlign: 'left',
            fontSize: '1em',
            color: '#555',
        },
        date: {
            textAlign: 'right',
            fontSize: '1em',
            color: '#555',
        },
        footerInfo: {
            fontSize: '0.9em',
            color: '#555',
            textAlign: 'center',
            marginTop: '15px',
            fontStyle: 'italic',
        },
        cornerCircle: {
            position: 'absolute',
            width: '20px',
            height: '20px',
            background: '#2bb99a',
            borderRadius: '50%',
        },
        modulesList: {
            listStyleType: 'none',
            padding: 0,
            textAlign: 'center',
            marginTop: '10px',
        },
        moduleItem: {
            fontSize: '1.2rem',
            marginBottom: '5px',
            fontWeight: 'normal',
        },
    };
    

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyles}>
            <div id="certificate-to-print" style={certificateStyles.container}>
                <img src={certificatLogo} alt="UNIT Logo" style={certificateStyles.logo} />
                <div style={certificateStyles.icon}><i className="fas fa-award"></i></div>
                <h1 style={certificateStyles.header}>Certificat de Formation</h1>
                <div style={certificateStyles.slogan}>Éducation et Excellence pour un avenir prometteur</div>
                <h2>Ceci est une attestation officielle que</h2>
<div style={certificateStyles.name}>{userName}</div>
<div class={certificateStyles.content}>a brillamment complété l'intégralité du programme de formation intitulé</div>
<div style={certificateStyles.course}>{formationName}</div>
<div style={certificateStyles.separator}></div>
<div class={certificateStyles.content}>dispensée par le centre de formation UN-IT, et a démontré une maîtrise approfondie des compétences essentielles et des connaissances requises dans le domaine spécifique abordé, conformément aux critères d'évaluation du programme.</div>
                {/* Ajouter une section pour les modules */}
                {modules && modules.length > 0 && (
    <>
        <div className={certificateStyles.content}>
            Les modules suivants ont été complétés avec succès dans le cadre de la formation :
        </div>

        <div>
            {modules.map((module, index) => module.name).join(", ")}
        </div>
    </>
)}

                <div style={certificateStyles.footer}>
                    <div style={certificateStyles.signature}>
                        <hr style={{ width: '150px', border: '1px solid #085a94' }} />
                        <p>Signature de l'Instructeur</p>
                    </div>
                    <div style={certificateStyles.date}>
                        <p>Date : {obtentionDate}</p>
                    </div>
                </div>
                <div style={certificateStyles.footerInfo}>
                    <p>UN-IT - Excellence en formation depuis 2023</p>
                    <p>Contact : contact@unityfianar.site | +26134930349</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '20px' }}>
                <button
                    style={{
                        margin: '10px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                    }}
                    onClick={onRequestClose}
                >
                    Annuler
                </button>
                <button
                    style={{
                        margin: '10px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: '#085a94',
                        color: '#fff',
                    }}
                    onClick={handlePrint}
                    disabled={loading}
                >
                    {loading ? (
                          <ClipLoader color="#ffffff" size={20} /> // Spinner ici
                        ) : (<>
                  <i className=" fas fa-print"></i>  Imprimer</>
                )}
                </button>
            </div>
        </Modal>
    );
}

export default CertificationModal;
