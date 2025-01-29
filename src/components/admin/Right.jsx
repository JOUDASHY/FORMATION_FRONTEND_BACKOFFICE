import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axiosClient from "../../axiosClient";

function Right() {
    const [emails, setEmails] = useState([]); // State to store the emails
    const navigate = useNavigate(); // Initialize the navigate function

    // Fetch the contacts from the API
    useEffect(() => {
        const fetchEmails = async () => {
            try {
                const response = await axiosClient.get('/contacts');
                
                // Check if data has a 'results' key
                if (response.data.results && Array.isArray(response.data.results)) {
                    setEmails(response.data.results); // Update state with the results
                } else {
                    console.error("Expected an array in 'results' but received:", response.data);
                }
            } catch (error) {
                console.error("Error fetching emails:", error);
            }
        };

        fetchEmails();
    }, []);

    // Get the last two emails
    const lastThreeEmails = emails.slice(-2);

    return (
        <React.Fragment>
            <div className="card">
                {/* Emails Section */}
                <div className="recent-updates" style={styles.recentUpdates}>
                    <h2 style={styles.header}>Emails <i className="fas fa-envelope"></i></h2>
                    <div className="updates">
                        {lastThreeEmails.map((email) => (
                            <div className="update" key={email.id} style={styles.update}>
                                <div className="profile-photo" style={styles.profilePhoto}>
                                    <i className="fas fa-user" style={styles.userIcon}></i>
                                </div>
                                <div className="message">
                                    <p><b>{email.name}</b> ({email.email})</p>
                                    <p>{email.message}</p>
                                    <small className="text-muted">{new Date(email.created_at).toLocaleString()}</small>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add the "Voir tous les emails" button */}
                    <button
                        onClick={() => navigate("/AllEmails")}
                        style={styles.allEmailsBtn}
                    >
                        <i className="fas fa-envelope" style={styles.icon}></i> {/* Icône d'enveloppe */}
                        Voir tous les emails
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
}

// Styles for the component
const styles = {
    recentUpdates: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginTop: '20px',
    },
    header: {
        marginBottom: '10px',
        fontSize: '20px',
        fontWeight: 'bold',
    },
    update: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '4px',
        borderBottom: '1px solid #ddd',
        transition: 'background-color 0.3s',
    },
    profilePhoto: {
        width: '2.8rem',
        height: '2.8rem',
        borderRadius: '50%',
        backgroundColor: '#ddd', // Placeholder background color
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '10px',
    },
    userIcon: {
        fontSize: '1.5rem',
        color: '#888', // Placeholder icon color
    },
    allEmailsBtn: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#d9534f',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        marginTop: '10px',
        borderRadius: '5px',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'background-color 0.3s',
    },
    icon: {
        marginRight: '10px',
        fontSize: '20px',
    },
};

export default Right;
