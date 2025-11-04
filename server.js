// server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });
let players = []

server.on('connection', socket => {
  console.log('🟢 New client connected');

  socket.on('message', message => {
    const data = JSON.parse(message);
    if (data.type == 'login'){
      socket.send(JSON.stringify({message: players}))
      players.push({username: data.username})
      console.log(players)
    }
  });

  
  socket.on('close', () => {
    console.log('🔴 Client disconnected');
  });
});


