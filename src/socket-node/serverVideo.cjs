const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Variable pour garder une trace de l'état de la conférence
let activeConference = false;
let rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Écoute de l'événement pour vérifier si une conférence est active
  socket.on('checkConferenceStatus', (callback) => {
    console.log("Checking conference status...");
    callback(activeConference);  // Renvoie true si une conférence est active, sinon false
  });

  socket.on('checkRoomAvailability', (roomName, callback) => {
    if (rooms[roomName]) {
      callback(false);
    } else {
      callback(true);
    }
  });

  socket.on('broadcaster', (roomName) => {
    if (!roomName) {
      console.log("Room name is undefined or invalid for broadcaster");
      return;
    }  
    if (!rooms[roomName]) {
      rooms[roomName] = { broadcaster: socket.id, watchers: [] };
      socket.join(roomName);
      io.to(roomName).emit('broadcaster', roomName);
      console.log(`Broadcaster started in room: ${roomName}`);
      
      // Démarre une conférence si ce n'est pas déjà fait
      if (!activeConference) {
        activeConference = true;
        console.log("A conference has started.");
      }
    } else {
      console.log(`Room ${roomName} is already occupied`);
    }
  });

  socket.on('watcher', (roomName) => {
    if (!roomName) {
      console.log("Room name is undefined or invalid for watcher");
      return;
    }
    const room = rooms[roomName];
    if (room && room.broadcaster) {
      room.watchers.push(socket.id);
      socket.join(roomName);
      socket.to(room.broadcaster).emit('watcher', socket.id);
      console.log(`Watcher ${socket.id} joined room: ${roomName}`);
    } else {
      console.log(`Room ${roomName} is not available for watchers`);
    }
  });

  socket.on('offer', (id, message) => {
    socket.to(id).emit('offer', socket.id, message);
  });

  socket.on('answer', (id, message) => {
    socket.to(id).emit('answer', socket.id, message);
  });

  socket.on('candidate', (id, message) => {
    socket.to(id).emit('candidate', socket.id, message);
  });

  socket.on('endConference', (roomName) => {
    if (rooms[roomName]) {
      delete rooms[roomName];
      io.to(roomName).emit('endConference');
      console.log(`Room ${roomName} is now free`);
      
      // Si aucune autre conférence n'est active, mettre à jour l'état
      activeConference = false;
      console.log("Conference ended.");
    } else {
      console.log(`Room ${roomName} does not exist`);
    }
  });

  socket.on('disconnect', () => {
    Object.keys(rooms).forEach((roomName) => {
      const room = rooms[roomName];
      if (room.watchers.includes(socket.id)) {
        room.watchers = room.watchers.filter(id => id !== socket.id);
        socket.to(room.broadcaster).emit('disconnectPeer', socket.id);
      }
      if (room.broadcaster === socket.id) {
        delete rooms[roomName];
        io.to(roomName).emit('endConference');
        console.log(`Room ${roomName} closed as broadcaster disconnected`);
        
        // Mettre à jour l'état si le dernier participant quitte
        activeConference = false;
        console.log("Conference ended due to broadcaster disconnect.");
      }
    });
  });
});

const PORT = 5002;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
