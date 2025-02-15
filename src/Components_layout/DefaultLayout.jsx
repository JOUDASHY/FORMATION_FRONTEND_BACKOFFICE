import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useStateContext } from '../contexts/contextprovider';
import Aside from '../components/Aside';
import Navbar from '../components/Navbar';
// import LoadingBar from 'react-top-loading-bar'; // Importez LoadingBar
import bgImage from '../assets/css/images/bg.jpg';
import '../assets/css/argon-dashboard.css';
import '../assets/css/argon-dashboard.min.css';

export default function DefaultLayout() {
    const { user, token, setUser, setToken } = useStateContext();
    const location = useLocation();
    const userId = user?.id;
    // const progressRef = useRef(null); // Référence pour la barre de progression

    // WebSocket effect
    useEffect(() => {
        const baseUrl = window.location.origin;
console.log("URL ............ :",baseUrl); // Ex: http://localhost:3000 ou https://monapp.com

            const socket = new WebSocket(`wss://${import.meta.env.VITE_SOCKET_URL.replace(/^https?:\/\//, '')}/ws/onlineUsers`);


        socket.onopen = () => {
            if (userId) {
                console.log('Connected to WebSocket online_srv' );
                socket.send(JSON.stringify({ userId }));
            }
        };

        socket.onclose = () => {
            console.log('Disconnected from server');
        };

        return () => socket.close();
    }, [userId]);

    // Barre de progression lors de la navigation
    // useEffect(() => {
    //     if (progressRef.current) {
    //         progressRef.current.continuousStart(); // Démarrer la barre
    //     }
    //     return () => {
    //         if (progressRef.current) {
    //             progressRef.current.complete(); // Compléter la barre à la fin
    //         }
    //     };
    // }, [location]);

    if (!token) {
        return <Navigate to='/login' />;
    }

    return (
        <>
        {/* <LoadingBar color="#f11946" ref={progressRef} />  */}
        <div
    className="position-fixed w-100 h-100 top-0 start-0"
    style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        zIndex: '-1',
        filter: 'blur(1px) brightness(0.8)', // Rend l'image floue et plus lumineuse
    }}
>
    <div
        className="position-absolute w-100 h-100"
        style={{
            backgroundColor: 'rgba(0, 255, 0, 0.3)', // Couche semi-transparente claire
            mixBlendMode: 'screen', // Ajoute un effet lumineux
        }}
    ></div>
</div>

        <Aside user={user} setUser={setUser} setToken={setToken} />
        <main className="main-content position-relative border-radius-lg">
            <Navbar user={user} />
            <div className="container-fluid py-4">
                
                <Outlet />
            </div>
        </main>
    </>
    
    );
}
