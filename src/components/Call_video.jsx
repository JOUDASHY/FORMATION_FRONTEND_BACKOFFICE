// import Button from "@material-ui/core/Button"
// import IconButton from "@material-ui/core/IconButton"
// import TextField from "@material-ui/core/TextField"
// import AssignmentIcon from "@material-ui/icons/Assignment"
// import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
// import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"

// Connexion au serveur socket
const socket = io.connect(`wss://${import.meta.env.VITE_API_BASE_URL.replace(/^https?:\/\//, '')}:5000`)

function Call_video({ user }) {
	const [me, setMe] = useState(user.id); // Utiliser `user.id` directement
	const [stream, setStream] = useState(null);
	const [receivingCall, setReceivingCall] = useState(false);
	const [caller, setCaller] = useState("");
	const [callerSignal, setCallerSignal] = useState(null);
	const [callAccepted, setCallAccepted] = useState(false);
	const [idToCall, setIdToCall] = useState(""); // L'ID de l'utilisateur à appeler
	const [callEnded, setCallEnded] = useState(false);
	const [name, setName] = useState(user.name || ""); // Utiliser le nom de l'utilisateur
	const myVideo = useRef();
	const userVideo = useRef();
	const connectionRef = useRef();
  
	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
			myVideo.current.srcObject = stream
		})
	
		// Envoyer l'identifiant utilisateur au serveur après la connexion
		socket.emit("registerUser", user.id)
	
		// Écouter l'événement "me" pour confirmer l'enregistrement
		socket.on("me", (id) => {
			setMe(id)
		})
	
		socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})
	}, [user.id])
	
  
	const callUser = (id) => {
	  const peer = new Peer({
		initiator: true,
		trickle: false,
		stream: stream,
	  });
  
	  peer.on("signal", (data) => {
		socket.emit("callUser", {
		  userToCall: id,
		  signalData: data,
		  from: me,
		  name: name,
		});
	  });
  
	  peer.on("stream", (stream) => {
		userVideo.current.srcObject = stream;
	  });
  
	  socket.on("callAccepted", (signal) => {
		setCallAccepted(true);
		peer.signal(signal);
	  });
  
	  connectionRef.current = peer;
	};
  
	const answerCall = () => {
	  setCallAccepted(true);
	  const peer = new Peer({
		initiator: false,
		trickle: false,
		stream: stream,
	  });
  
	  peer.on("signal", (data) => {
		socket.emit("answerCall", { signal: data, to: caller });
	  });
  
	  peer.on("stream", (stream) => {
		userVideo.current.srcObject = stream;
	  });
  
	  peer.signal(callerSignal);
	  connectionRef.current = peer;
	};
  
	const leaveCall = () => {
	  setCallEnded(true);
	  connectionRef.current.destroy();
	};
  
	return (
	  <>
		<h1 style={{ textAlign: "center", color: "#fff" }}>Zoomish</h1>
		<div className="container">
		  <div className="video-container">
			<div className="video">
			  {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
			</div>
			<div className="video">
			  {callAccepted && !callEnded ? (
				<video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
			  ) : null}
			</div>
		  </div>
		  <div className="myId">
			<label htmlFor="name" style={{ color: "#fff" }}>Name</label>
			<input
			  id="name"
			  type="text"
			  value={name}
			  onChange={(e) => setName(e.target.value)}
			  style={{ marginBottom: "20px", padding: "10px", fontSize: "16px" }}
			/>
			<label htmlFor="idToCall" style={{ color: "#fff" }}>ID to call</label>
			<input
			  id="idToCall"
			  type="text"
			  value={idToCall}
			  onChange={(e) => setIdToCall(e.target.value)}
			  style={{ marginBottom: "20px", padding: "10px", fontSize: "16px" }}
			/>
			<div className="call-button" style={{ marginTop: "20px" }}>
			  {callAccepted && !callEnded ? (
				<button
				  onClick={leaveCall}
				  style={{ padding: "10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px" }}
				>
				  End Call
				</button>
			  ) : (
				<button
				  onClick={() => callUser(idToCall)}
				  style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px" }}
				>
				  Call
				</button>
			  )}
			</div>
		  </div>
		  <div>
			{receivingCall && !callAccepted ? (
			  <div className="caller">
				<h1>{name} is calling...</h1>
				<button
				  onClick={answerCall}
				  style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px" }}
				>
				  Answer
				</button>
			  </div>
			) : null}
		  </div>
		</div>
	  </>
	);
  }
  


export default Call_video