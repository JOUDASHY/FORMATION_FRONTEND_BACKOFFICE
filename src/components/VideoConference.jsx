import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import axiosClient from '../axiosClient';
import Swal from 'sweetalert2';

const socket = io(`${import.meta.env.VITE_SOCKET_URL}/video`); // Connexion au serveur socket.io

const VideoConference = ({ user }) => {
  const userType = user.type;
  const videoRef = useRef();
  const peerConnections = useRef({});
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false); // État pour le mute
  const [isCameraOn, setIsCameraOn] = useState(true); // État pour la caméra
  const [isConferenceStarted, setIsConferenceStarted] = useState(false); // État pour la conférence
  const [callDuration, setCallDuration] = useState(0); // État pour la durée de l'appel
  const [formations, setFormations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        // Firefox
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        // Chrome, Safari et Opera
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        // IE/Edge
        videoRef.current.msRequestFullscreen();
      }
    }
  };
  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
  };
  useEffect(() => {
    axiosClient.get(user.type === 'apprenant' ? "/Formation_apprenant" : 
"/Formation_formateur")
      .then((response) => {
        setFormations(response.data.results); 
      })
      .catch((error) => console.error("Erreur de récupération des formations", error));
  }, []);

  useEffect(() => {
    if (!isConferenceStarted) return;

    const constraints = { video: true, audio: true };

    if (userType === 'formateur') {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        videoRef.current.srcObject = stream;
        socket.emit('broadcaster');

        socket.on('watcher', (id) => {
          const peerConnection = new RTCPeerConnection();
          peerConnections.current[id] = peerConnection;

          stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit('candidate', id, event.candidate);
            }
          };

          peerConnection
            .createOffer()
            .then((sdp) => peerConnection.setLocalDescription(sdp))
            .then(() => {
              socket.emit('offer', id, peerConnection.localDescription);
            });
        });

        socket.on('answer', (id, description) => {
          peerConnections.current[id].setRemoteDescription(description);
        });

        socket.on('candidate', (id, candidate) => {
          peerConnections.current[id].addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on('disconnectPeer', (id) => {
          if (peerConnections.current[id]) {
            peerConnections.current[id].close();
            delete peerConnections.current[id];
          }
        });
      });
    }

    if (userType === 'apprenant') {
      socket.emit('watcher');

      const peerConnection = new RTCPeerConnection();

      peerConnection.ontrack = (event) => {
        videoRef.current.srcObject = event.streams[0];
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', broadcaster, event.candidate);
        }
      };

      socket.on('offer', (id, description) => {
        peerConnection
          .setRemoteDescription(description)
          .then(() => peerConnection.createAnswer())
          .then((sdp) => peerConnection.setLocalDescription(sdp))
          .then(() => {
            socket.emit('answer', id, peerConnection.localDescription);
          });
      });

      socket.on('candidate', (id, candidate) => {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });
    }

    return () => {
      socket.off('broadcaster');
      socket.off('watcher');
      socket.off('offer');
      socket.off('answer');
      socket.off('candidate');
    };
  }, [userType, isConferenceStarted]);

  useEffect(() => {
    let interval;
    if (isConferenceStarted) {
      interval = setInterval(() => {
        setCallDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => clearInterval(interval);
  }, [isConferenceStarted]);
  const formatTime = (duration) => {
    const hours = String(Math.floor(duration / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((duration % 3600) / 60)).padStart(2, '0');
    const seconds = String(duration % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  const handleMute = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled; // Activer/Désactiver la piste vidéo uniquement
        setIsCameraOn(videoTrack.enabled);
  
        // Informer les apprenants que la caméra est désactivée
        socket.emit('cameraStatusChange', videoTrack.enabled);
      }
    }
  };
  
  useEffect(() => {
    // Gestion de l'événement pour la caméra du formateur côté apprenant
    socket.on('cameraStatusChange', (isCameraOn) => {
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = isCameraOn; // Ajuster l'affichage vidéo en fonction de l'état caméra du formateur
        });
      }
    });
  
    return () => {
      socket.off('cameraStatusChange');
    };
  }, []);
  

  const startConference = () => {
    if (!selectedRoom) {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Veuillez sélectionner d\'abord une formation ',
      });
      return;
    }
  
    if (userType === 'formateur') {
      // Vérifiez si la salle est disponible seulement pour le formateur
      socket.emit('checkRoomAvailability', selectedRoom, (isAvailable) => {
        if (isAvailable) {
          // La salle est disponible, démarrer la conférence
          setIsConferenceStarted(true);
          socket.emit('broadcaster', selectedRoom); // Envoie le nom de la salle
     
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Formation occupée',
            text: 'Cette formation est déjà occupée par un formateur !',
          });
        }
      });
    } else if (userType === 'apprenant') {
      // Un apprenant peut simplement rejoindre sans vérifier la disponibilité
      setIsConferenceStarted(true);
      socket.emit('watcher', selectedRoom); // Envoie le nom de la salle pour rejoindre

    }
  };
  
  

  const endCall = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    Object.values(peerConnections.current).forEach((peerConnection) => {
      peerConnection.close();
    });
    peerConnections.current = {};
    // Mettre fin à la conférence
    if (user.type === 'formateur') {
    socket.emit('endConference', selectedRoom); // Notifie le serveur que la conférence est terminée 
    setIsConferenceStarted(false); // Mettre à jour l'interface utilisateur pour dire que la conférence est terminée
    };
    if (user.type === 'apprenant') {
      socket.emit('disconnectPeer');
    setIsConferenceStarted(false); // Mettre à jour l'interface utilisateur pour dire que la conférence est terminée

    };
  
}



  
  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  return (
<div className="container-fluid mt-0 h-100 vw-80 w-80" style={{ height: '100vh' }}>
  <div className="d-flex justify-content-center align-items-center h-100">
    <div className="card shadow-lg border-0 w-100 h-100 d-flex flex-column" style={{ maxWidth: '100vw' }}>
      {/* En-tête */}
      <div className="card-header bg-dark text-white text-center">
        <h5 className="mb-0">Vidéoconférence en Direct</h5>
        <small>Connecté en tant que : <span className="fw-bold">{user.name}</span></small>
      </div>

      {/* Corps : Vidéo et boutons */}
      <div className="card-body d-flex flex-column p-0">
        {/* Section de sélection de formation */}
        <div className="p-3 bg-light border-bottom">
          <div className="d-flex flex-column flex-sm-row align-items-center">
            <label className="form-label me-3 mb-2 mb-sm-0 d-none d-sm-inline">
              <i className="fa fa-book me-1"></i>Sélectionnez d'abord une formation :
            </label>
            <select
              className="form-select"
              style={{ maxWidth: '300px' }}
              value={selectedRoom}
              onChange={handleRoomChange}
            >
              <option value="">Choisir une formation</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.name}>
                  {formation.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vidéo */}
        <div
      className="flex-grow-1 d-flex align-items-center justify-content-center bg-dark"
      onClick={handleFullScreen}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-100"
        style={{ height: "100%", objectFit: "contain", cursor: "pointer" }}
      />
    </div>

        {/* Boutons de contrôle */}
        <div className="bg-dark bg-opacity-75 py-2">
          <div className="d-flex flex-wrap justify-content-around align-items-center">
            <button className="btn btn-light btn-sm mb-2 mb-sm-0" onClick={handleMute}>
              <i className={`fa fa-microphone${isMuted ? '-slash' : ''}`} />
              <span className="d-none d-sm-inline">{isMuted ? 'Activer Micro' : 'Mute'}</span>
            </button>

            <button
              className={`btn btn-${isConferenceStarted ? 'danger' : 'primary'} btn-sm mb-2 mb-sm-0`}
              onClick={isConferenceStarted ? endCall : startConference}
            >
              <i className="fa fa-phone" />
              <span className="d-none d-sm-inline">
                {isConferenceStarted
                  ? user.type === 'formateur'
                    ? 'Fin de l’appel'
                    : 'Quitter la conférence'
                  : user.type === 'formateur'
                  ? 'Démarrer la conférence'
                  : 'Assister à la conférence'}
              </span>
            </button>

            <button className="btn btn-light btn-sm mb-2 mb-sm-0" onClick={toggleCamera}>
              <i className={`fa fa-video${isCameraOn ? '' : '-slash'}`} />
              <span className="d-none d-sm-inline">{isCameraOn ? 'Désactiver Caméra' : 'Activer Caméra'}</span>
            </button>

            <div className="d-flex align-items-center text-white">
              <label htmlFor="volume-control" className="me-2 d-none d-sm-inline">Volume</label>
              <input
                type="range"
                id="volume-control"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                style={{ width: '100px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Durée de l'appel */}
      <div className="card-footer text-muted text-center">
        <small>Durée de l’appel : <span>{formatTime(callDuration)}</span></small>
        {user.type === 'formateur' && isConferenceStarted && (
          <div
            className="ms-3"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'red',
              border: '2px solid white',
              animation: 'pulse 1s infinite',
            }}
          />
        )}
      </div>

      {/* Style pour l'animation de pulsation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  </div>
</div>







  );
};

export default VideoConference;
