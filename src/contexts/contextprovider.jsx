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
        console.log("Expiration time from localStorage:", expirationTime);
        
        if (expirationTime) {
            const currentTime = new Date().getTime();
            console.log("Current time:", currentTime);
            
            const timeRemaining = expirationTime - currentTime;
            console.log("Time remaining until expiration:", timeRemaining);
            
            if (timeRemaining <= 0) {
                console.log("Token expired! Removing token and user.");
                setToken(null);
                updateUser(null);
            } else {
                // Sinon, configurer un timer pour l'expiration
                const timer = setTimeout(() => {
                    console.log("Token expired after timeout. Removing token and user.");
                    setToken(null);
                    updateUser(null);
                }, timeRemaining);

                return () => clearTimeout(timer); // Nettoyage du timer
            }
        }
    }, []); // Le tableau vide ici garantit que ce useEffect s'exécute une seule fois au chargement du composant.

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
