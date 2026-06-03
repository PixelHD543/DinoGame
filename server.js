const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Healthcheck endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files (optional)
app.use(express.static(path.join(__dirname, '/')));

// Store active game rooms
const rooms = new Map(); // roomId -> { players: [{id, playerIndex}], gameState, createdAt }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room (host)
  socket.on('createRoom', (roomId, callback) => {
    if (rooms.has(roomId)) {
      callback({ success: false, message: 'Room already exists' });
      return;
    }
    const room = {
      players: [{ id: socket.id, playerIndex: 1 }],
      gameState: null,
      createdAt: Date.now()
    };
    rooms.set(roomId, room);
    socket.join(roomId);
    callback({ success: true, playerIndex: 1, playerCount: 1 });
    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  // Join an existing room
  socket.on('joinRoom', (roomId, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      callback({ success: false, message: 'Room does not exist' });
      return;
    }
    if (room.players.length >= 2) {
      callback({ success: false, message: 'Room is full' });
      return;
    }
    const playerIndex = 2;
    room.players.push({ id: socket.id, playerIndex });
    socket.join(roomId);
    callback({ success: true, playerIndex, playerCount: room.players.length });
    console.log(`Player ${socket.id} joined room ${roomId}`);
    
    // Notify both players that room is ready
    io.to(roomId).emit('roomJoined', { playerCount: room.players.length });
    
    if (room.players.length === 2) {
      io.to(roomId).emit('gameReady', { message: 'Both players ready! Game starting...' });
    }
  });

  // Leave room
  socket.on('leaveRoom', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        socket.leave(roomId);
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          io.to(roomId).emit('opponentDisconnected');
          console.log(`Player ${socket.id} left room ${roomId}`);
        }
      }
    }
  });

  // Game action (play card, attack, end turn, etc.)
  socket.on('gameAction', (roomId, action, data) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // Broadcast action to the other player in the room
    socket.to(roomId).emit('opponentAction', action, data);
    console.log(`Game action in ${roomId}: ${action}`);
  });

  // Update game state (full sync)
  socket.on('updateGameState', (roomId, gameState) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.gameState = gameState;
    socket.to(roomId).emit('gameStateUpdate', gameState);
  });

  // Request full game state
  socket.on('requestGameState', (roomId) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;
    socket.emit('gameStateUpdate', room.gameState);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from any rooms
    for (let [roomId, room] of rooms.entries()) {
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        socket.leave(roomId);
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          io.to(roomId).emit('opponentDisconnected');
          console.log(`Player ${socket.id} disconnected from room ${roomId}`);
        }
        break;
      }
    }
  });
});

// Clean up old rooms periodically (older than 1 hour)
setInterval(() => {
  const now = Date.now();
  for (let [roomId, room] of rooms.entries()) {
    if (now - room.createdAt > 3600000) { // 1 hour
      rooms.delete(roomId);
      console.log(`Room ${roomId} cleaned up (expired)`);
    }
  }
}, 600000); // Every 10 minutes

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
