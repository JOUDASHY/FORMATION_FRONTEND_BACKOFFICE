import { createBrowserRouter, Route, Routes } from 'react-router-dom';
import { useStateContext } from './contexts/contextprovider';  // Assurez-vous que le chemin est correct
import DefaultLayout from './Components_layout/DefaultLayout.jsx';
import GuestLayout from './Components_layout/GuestLayout.jsx';
import Login from './auth/login.jsx';
import Register from './auth/register.jsx';
import AllEmails from './components/admin/AllEmails.jsx';
import Module from './components/admin/Module.jsx';
import Planning_admin from './components/admin/Planning_admin.jsx';

import Dash_admin from './components/admin/Dash_admin.jsx';
import Room from './components/admin/Room.jsx';
import Dashboard from './components/apprenant/Dash_apprenant.jsx';
import Planning from './components/apprenant/Planning.jsx';
import Lesson_apprenant from './components/apprenant/Lesson_apprenant.jsx';
import Evaluation_apprenant from './components/apprenant/Evaluation_apprenant.jsx';
import Formation from './components/apprenant/Formation.jsx';
import Dash_formateur from './components/formateur/Dash_formateur.jsx';
import Evaluation_list from './components/formateur/Evaluation_list.jsx';
import Dashboard_ from './components/formateur/Dashboard.jsx';


import Planning_list from './components/formateur/Planning_list.jsx';
import Planning_Formateur from './components/formateur/Planning_formateur.jsx';
import Lesson_formateur from './components/formateur/Lesson_formateur.jsx';
import Presence_list from './components/formateur/Presence_list.jsx';
import Inscription from './components/admin/Inscription.jsx';
import Formateur from './components/admin/Formateur.jsx';
import Formation_admin from './components/admin/Formation_admin.jsx';
import InscriptionbyFomation from './components/admin/InscriptionbyFomation.jsx';

import Certification from './components/admin/Certification.jsx';
import Payment_history from './components/admin/Payment_history.jsx';


import Apprenant from './components/admin/Apprenant.jsx';
import Admin from './components/admin/Admin.jsx';
import Course from './components/admin/Course.jsx';
import User from './components/admin/User.jsx';
import CertificationbyFomation from './components/admin/CertificationbyFomation.jsx';
import Recherche_user from './components/Recherche_user.jsx';
import Notification_list from './components/Notification_list.jsx';
import MessageList from './components/MessageList.jsx';
import Chat from './components/Chat.jsx';
import Forum from './components/Forum.jsx';
import Profile from './components/Profile.jsx';
import VideoConference from './components/VideoConference.jsx';
// import VideoRoom from './components/VideoRoom.jsx';
import Online_user from './components/Online_user.jsx';
import Chatbot from './components/Chatbot.jsx';

import Gemini_api from './components/Gemini_api.jsx';
// import Call_video from './components/Call_video.jsx';
import NotFound from './components/NotFound.jsx';




import ForgotPassword from './auth/ForgotPassword.jsx'; // Assurez-vous que le chemin est correct
import ResetPassword from './auth/ResetPassword.jsx'; // Assurez-vous que le chemin est correct
import SetPassword from './auth/SetPassword.jsx'; // Assurez-vous que le chemin est correct
// import Call_user from "./components/Call_user"; // Chemin vers Call_video.jsx
// import Call_video from "./components/Call_video"; // Chemin vers Call_video.jsx

const RoutesWithAuth = () => {
  const { user } = useStateContext(); // Assurez-vous que l'utilisateur est bien récupéré
  console.log("user :", user); // Debug : Vérifiez dans la console

  // Si user n'est pas défini, afficher un message temporaire
  if (!user) {
    return <div>Chargement des informations utilisateur...</div>;
  }

  return (
    <Routes>
      {/* Routes pour l'admin */}
      {user?.type === 'admin' && (
        <>
          <Route path="AllEmails" element={<AllEmails user={user} />} />
          <Route path="Module" element={<Module user={user} />} />
          <Route path="Room" element={<Room user={user} />} />
          <Route path="dashboard" element={<Dash_admin user={user} />} />
          <Route path="/" element={<Dash_admin user={user} />} />

          <Route path="Planning_admin/formations/:formationId" element={<Planning_admin user={user} />} />
          <Route path="Inscription" element={<Inscription user={user} />} />
          <Route path="user/Formateur" element={<Formateur user={user} />} />
          <Route path="Formation" element={<Formation_admin user={user} />} />
          <Route path="Certification" element={<Certification user={user} />} />
          <Route path="/user/apprenant" element={<Apprenant user={user} />} />
          <Route path="user/admin" element={<Admin user={user} />} />
          <Route path="CertificationbyFomation/:formationId" element={<CertificationbyFomation user={user} />} />
          <Route path="InscriptionbyFomation/:formationId" element={<InscriptionbyFomation user={user} />} />
          <Route path="User" element={<User user={user} />} />
          <Route path="course" element={<Course user={user} />} />
          
        </>
      )}
      {/* Routes pour l'apprenant */}
      {user?.type === 'apprenant' && (
        <>
          <Route path="User" element={<User user={user} />} />

          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="Planning_admin/formations/:formationId" element={<Planning_admin user={user} />} />
          <Route path="Lesson_apprenant" element={<Lesson_apprenant user={user} />} />
          <Route path="Formation" element={<Formation user={user} />} />
          <Route path="/evaluations/formation/:formationId" element={<Evaluation_apprenant />} />
        </>
      )}
      {/* Routes pour le formateur */}
      {user?.type === 'formateur' && (
        <>
          <Route path="/" element={<Dash_formateur user={user} />} />
          <Route path="Planning_Formateur" element={<Planning_Formateur user={user} />} />
          <Route path="Presence_list" element={<Planning_list user={user} />} />
          <Route path="Lesson_formateur" element={<Lesson_formateur user={user} />} />
          <Route path="Presence_list/:planningId" element={<Presence_list user={user} />} />
          <Route path="/evaluations/formation/:formation_id" element={<Evaluation_list />} />
          <Route path="/Dashboard_" element={<Dashboard_ />} />
        </>
      )}
      {/* Routes communes */}
      <Route path="Notification_list" element={<Notification_list user={user} />} />
      <Route path="Recherche_user" element={<Recherche_user user={user} />} />
      <Route path="Forum" element={<Forum user={user} />} />
      <Route path="MessageList" element={<MessageList user={user} />} />
      <Route path="chat/:Id" element={<Chat user={user} />} />
      <Route path="Profile" element={<Profile user={user} />} />
      <Route path="Profile/:userId" element={<Profile user={user} />} />
      <Route path="VideoConference" element={<VideoConference user={user} />} />
      <Route path="Online_user" element={<Online_user currentuser={user} />} />
      {/* <Route path="Call_video" element={<Call_video user={user} />} /> */}

      <Route path="Chatbot" element={<Chatbot user={user} />} />
      {/* <Route path="Chatbot_hugginface" element={<Chatbot_hugginface user={user} />} /> */}
      <Route path="Gemini_api" element={<Gemini_api user={user} />} />
      
      <Route path="Payment_history" element={<Payment_history user={user} />} />
      <Route path="*" element={<NotFound />} />
      
      {/* <Route path="/call/:idToCall" element={<Call_video me={user} />} /> */}
      {/* <Route path="/" element={<VideoConference />} /> */}
        {/* <Route path="/VideoRoom/:roomId" element={<VideoRoom />} /> */}



    </Routes>
  );
};


const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      { path: '*', element: <RoutesWithAuth /> }, // Assurez-vous que toutes les routes d'authentification sont capturées
      { path: '/', element: <RoutesWithAuth /> }, // Assurez-vous que toutes les routes d'authentification sont capturées
    ],
  },
  // Routes invitées (non authentifiées)
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'forgot-password', 
        element: <ForgotPassword /> 
      },
      {
        path: 'password-reset/:token',  // Modifiez ici pour correspondre à l'URL dans l'email
        element: <ResetPassword /> 
      },
      {
        path: 'password-set/:token',  // Modifiez ici pour correspondre à l'URL dans l'email
        element: <SetPassword /> 
      }
      
    ],
  },
]);


export default router;
