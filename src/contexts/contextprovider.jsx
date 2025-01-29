import { useContext, useState, useEffect } from "react";
import { createContext } from "react";

const stateContext = createContext({
    user: null,
    token: null,
    setUser: () => {},
    setToken: () => {}
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('USER_INFO');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    const [token, _setToken] = useState(() => localStorage.getItem('ACCESS_TOKEN'));

    // Méthode pour définir le token avec expiration
    const setToken = (newToken, expiresIn) => {
        _setToken(newToken);
        if (newToken) {
            localStorage.setItem('ACCESS_TOKEN', newToken);
            // Calculer l'heure d'expiration en ms et l'enregistrer dans le localStorage
            const expirationTime = new Date().getTime() + expiresIn * 1000;
            localStorage.setItem('EXPIRATION_TIME', expirationTime);
        } else {
            localStorage.removeItem('ACCESS_TOKEN');
            localStorage.removeItem('EXPIRATION_TIME');
        }
    };

    const updateUser = (newUser) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('USER_INFO', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('USER_INFO');
        }
    };

    // Utilisation de useEffect pour surveiller l'expiration
    useEffect(() => {
        const expirationTime = localStorage.getItem('EXPIRATION_TIME');
        
        if (expirationTime) {
            const currentTime = new Date().getTime();
            const timeRemaining = expirationTime - currentTime;

            if (timeRemaining <= 0) {
                // Supprimer les données si expiré
                setToken(null);
                updateUser(null);
            } else {
                // Sinon, configuration d’un timer pour expiration
                const timer = setTimeout(() => {
                    setToken(null);
                    updateUser(null);
                }, timeRemaining);

                return () => clearTimeout(timer); // Nettoyage
            }
        }
    }, [token]);

    return (
        <stateContext.Provider value={{
            user,
            token,
            setUser: updateUser,
            setToken
        }}>
            {children}
        </stateContext.Provider>
    );
};

export const useStateContext = () => useContext(stateContext);
