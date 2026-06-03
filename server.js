const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (your existing game)
app.use(express.static(path.join(__dirname, '/')));

// Store active game rooms
const games = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join or create a game room
  socket.on('joinGame', (roomId, callback) => {
    let game = games.get(roomId);
    if (!game) {
      game = { players: [], state: null };
      games.set(roomId, game);
    }
    if (game.players.length >= 2) {
      callback({ success: false, message: 'Room is full' });
      return;
    }
    const playerIndex = game.players.length + 1;
    game.players.push({ id: socket.id, playerIndex });
    socket.join(roomId);
    callback({ success: true, playerIndex });

    if (game.players.length === 2) {
      // Initialise game state (send starting hands, etc.)
      io.to(roomId).emit('gameStart', { message: 'Both players ready!' });
    }
  });

  // Handle game actions
  socket.on('gameAction', (roomId, action, data) => {
    const game = games.get(roomId);
    if (!game) return;
    // Broadcast action to the other player
    socket.to(roomId).emit('opponentAction', action, data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from any game rooms
    for (let [roomId, game] of games.entries()) {
      const index = game.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        game.players.splice(index, 1);
        if (game.players.length === 0) {
          games.delete(roomId);
        } else {
          io.to(roomId).emit('opponentDisconnected');
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
