import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../axiosClient';

const Certificate = () => {
    const { id } = useParams();
    const [certification, setCertification] = useState(null);

    useEffect(() => {
        const fetchCertification = async () => {
            try {
                const response = await axiosClient.get(`/certifications/${id}`);
                setCertification(response.data.Certifications);
            } catch (error) {
                console.error('Erreur lors de la récupération de la certification:', error);
            }
        };

        fetchCertification();
    }, [id]);

    if (!certification) {
        return <div>Chargement...</div>;
    }

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#ffffff',
        },
        certificate: {
            width: '297mm',
            height: '210mm',
            padding: '40px',
            backgroundColor: '#ffffff',
            border: '12px double #085a94',
            borderRadius: '15px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            position: 'relative',
        },
        header: {
            fontSize: '3.2em',
            color: '#085a94',
            fontFamily: 'Times New Roman, serif',
            margin: '10px 0',
            textTransform: 'uppercase',
            letterSpacing: '4px',
        },
        subHeader: {
            fontSize: '1.8em',
            color: '#333333',
            fontStyle: 'italic',
            marginBottom: '30px',
        },
        recipient: {
            fontSize: '2.5em',
            fontWeight: 'bold',
            color: '#085a94',
            margin: '15px 0',
        },
        content: {
            fontSize: '1.4em',
            color: '#555555',
            lineHeight: '1.6em',
            margin: '15px 0',
            fontFamily: 'Arial, sans-serif',
        },
        course: {
            fontSize: '1.6em',
            color: '#2bb99a',
            margin: '15px 0',
            fontStyle: 'italic',
        },
        separator: {
            width: '60%',
            height: '3px',
            background: '#085a94',
            margin: '30px auto',
        },
        footer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '30px',
            padding: '0 60px',
        },
        signature: {
            textAlign: 'left',
            fontSize: '1em',
            color: '#555555',
            width: '150px',
        },
        date: {
            fontSize: '1em',
            color: '#555555',
            textAlign: 'right',
        },
        cornerCircle: {
            position: 'absolute',
            width: '20px',
            height: '20px',
            backgroundColor: '#2bb99a',
            borderRadius: '50%',
        },
        topLeft: {
            top: '20px',
            left: '20px',
        },
        topRight: {
            top: '20px',
            right: '20px',
        },
        bottomLeft: {
            bottom: '20px',
            left: '20px',
        },
        bottomRight: {
            bottom: '20px',
            right: '20px',
        },
        icon: {
            fontSize: '4em',
            color: '#FFD700',
            marginBottom: '10px',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.certificate}>
                <div style={{ ...styles.cornerCircle, ...styles.topLeft }}></div>
                <div style={{ ...styles.cornerCircle, ...styles.topRight }}></div>
                <div style={{ ...styles.cornerCircle, ...styles.bottomLeft }}></div>
                <div style={{ ...styles.cornerCircle, ...styles.bottomRight }}></div>

                <div style={styles.icon}><i className="fas fa-award"></i></div>
                <h1 style={styles.header}>Certificat de Formation</h1>
                <h2 style={styles.subHeader}>Ceci certifie que</h2>
                <div style={styles.recipient}>Mr./Mme {certification.user_id}</div>
                <div style={styles.content}>a complété avec succès la formation intitulée</div>
                <div style={styles.course}>{certification.formation_id}</div>
                <div style={styles.separator}></div>
                <div style={styles.content}>dispensée par UN-IT, démontrant les compétences requises dans ce domaine.</div>

                <div style={styles.footer}>
                    <div style={styles.signature}>
                        <hr style={{ border: '1px solid #085a94' }} />
                        <p>Signature de l'Instructeur</p>
                    </div>
                    <div style={styles.date}>
                        <p>Date : {new Date(certification.obtention_date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
