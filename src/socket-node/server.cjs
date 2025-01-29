const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"]
	}
})

const users = {} // Stocker les correspondances entre user.id et socket.id

io.on("connection", (socket) => {
	console.log("Connect: ", socket.id)

	// Réception de l'ID utilisateur depuis le client
	socket.on("registerUser", (userId) => {
		users[userId] = socket.id // Associer user.id à socket.id
		console.log("User registered:", userId, "->", socket.id)
		socket.emit("me", userId) // Retourner l'user.id au client
	})

	socket.on("disconnect", () => {
		// Trouver et supprimer l'utilisateur déconnecté
		const userId = Object.keys(users).find((key) => users[key] === socket.id)
		if (userId) {
			delete users[userId]
		}
		console.log("Disconnect: ", socket.id)
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		const userToCallSocketId = users[data.userToCall] // Récupérer le socket.id du destinataire
		if (userToCallSocketId) {
			io.to(userToCallSocketId).emit("callUser", {
				signal: data.signalData,
				from: data.from,
				name: data.name
			})
		}
	})

	socket.on("answerCall", (data) => {
		const callerSocketId = users[data.to] // Récupérer le socket.id de l'appelant
		if (callerSocketId) {
			io.to(callerSocketId).emit("callAccepted", data.signal)
		}
	})
})

server.listen(5000, () => console.log("server is running on port 5000"))
