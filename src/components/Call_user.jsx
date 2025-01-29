import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import "../App.css";

function Call_user({ user }) {
    const [me, setMe] = useState(user.id);
    const [stream, setStream] = useState(); // Initialize as undefined
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState("");
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const myVideo = useRef(null); // Initialize as null
    const userVideo = useRef(null); // Initialize as null
    const connectionRef = useRef();
    const socket = useRef();

    useEffect(() => {
        socket.current = io.connect('http://localhost:5000', {
            query: { userId: user.id }
        });
        navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                setStream(mediaStream);
                if (myVideo.current) { // Check if myVideo.current is defined
                    myVideo.current.srcObject = mediaStream;
                }
            })
            .catch((err) => {
                console.error("Error accessing media devices.", err);
            });

        socket.current.on("callUser", (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setName(data.name);
            setCallerSignal(data.signal);
        });

        return () => {
            socket.current.disconnect();
        };
    }, [user.id]);

    const callUser = (id) => {
        if (!stream) {
            console.error("Stream is undefined. Ensure media devices are accessed correctly.");
            return; // Prevent calling if stream is undefined
        }

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.current.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: me,
                name: name
            });
        });

        peer.on("stream", (mediaStream) => {
            if (userVideo.current) { // Check if userVideo.current is defined
                userVideo.current.srcObject = mediaStream;
            }
        });

        socket.current.on("callAccepted", (signal) => {
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
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.current.emit("answerCall", { signal: data, to: caller });
        });

        peer.on("stream", (mediaStream) => {
            if (userVideo.current) { // Check if userVideo.current is defined
                userVideo.current.srcObject = mediaStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current.destroy();
        socket.current.emit("callEnded", me);
    };

    return (
        <>
            <h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
            <div className="container">
                <div className="video-container">
                    <div className="video">
                        {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
                    </div>
                    <div className="video">
                        {callAccepted && !callEnded ? (
                            <video playsInline ref={userVideo} autoPlay style={{ width: "300px"}} />
                        ) : null}
                    </div>
                </div>
                <div className="myId">
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ marginBottom: "20px", padding: "10px", width: "100%", boxSizing: "border-box" }}
                    />
                    <button
                        onClick={() => navigator.clipboard.writeText(me)}
                        style={{ marginBottom: "20px", padding: "10px", width: "100%", backgroundColor: "#3f51b5", color: "white", border: "none", cursor: "pointer" }}
                    >
                        Copy ID
                    </button>
                    <input
                        type="text"
                        placeholder="ID to call"
                        value={idToCall}
                        onChange={(e) => setIdToCall(e.target.value)}
                        style={{ marginBottom: "10px", padding: "10px", width: "100%", boxSizing: "border-box" }}
                    />
                    <div className="call-button">
                        {callAccepted && !callEnded ? (
                            <button
                                onClick={leaveCall}
                                style={{ padding: "10px", backgroundColor: "#f44336", color: "white", border: "none", cursor: "pointer" }}
                            >
                                End Call
                            </button>
                        ) : (
                            <button
                                onClick={() => callUser(idToCall)}
                                style={{ padding: "10px", backgroundColor: "#3f51b5", color: "white", border: "none", cursor: "pointer" }}
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
                                style={{ padding: "10px", backgroundColor: "#3f51b5", color: "white", border: "none", cursor: "pointer" }}
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

export default Call_user;
