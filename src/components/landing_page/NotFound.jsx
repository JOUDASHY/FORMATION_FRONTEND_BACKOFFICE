import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#fff", // Fond blanc
        textAlign: "center",
        fontFamily: "'Poppins', sans-serif",
        padding: "20px",
      }}
    >
      {/* Image illustrative */}
      <img
        src="/images/404-illustration.svg" // Assurez-vous d'avoir cette image dans votre projet
        alt="404 Error"
        style={{
          maxWidth: "400px",
          width: "100%",
          marginBottom: "20px",
          animation: "float 3s ease-in-out infinite",
        }}
      />

      {/* Titre principal */}
      <h1
        style={{
          fontSize: "3rem",
          color: "var(--blue)",
          margin: "10px 0",
          fontWeight: "bold",
        }}
      >
        Oops! Page introuvable
      </h1>

      {/* Message secondaire */}
      <p
        style={{
          fontSize: "1.2rem",
          color: "#555",
          maxWidth: "600px",
          margin: "0 auto 20px auto",
        }}
      >
        Nous sommes désolés, mais la page que vous cherchez n'existe pas. 
        Retournez à l'accueil ou explorez d'autres pages.
      </p>

      {/* Bouton de retour */}
      <Link
        to="/"
        style={{
          display: "inline-block",
          padding: "12px 30px",
          fontSize: "1rem",
          color: "#fff",
          backgroundColor: "var(--vert)",
          borderRadius: "30px",
          textDecoration: "none",
          fontWeight: "bold",
          transition: "0.3s",
          boxShadow: "0 4px 8px rgba(43, 185, 154, 0.3)",
        }}
        onMouseOver={(e) =>
          (e.target.style.backgroundColor = "#249a82")
        }
        onMouseOut={(e) =>
          (e.target.style.backgroundColor = "var(--vert)")
        }
      >
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default NotFound;
