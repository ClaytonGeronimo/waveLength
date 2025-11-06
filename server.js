// server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });
const clients = new Map()
const players = []
playersTurn = 1

server.on('connection', ws => {
  console.log('🟢 New client connected'); 

  // determines the action to take given a message send from client side
  ws.on('message', message => {
    const data = JSON.parse(message);
    if (data.type == 'login'){
      // adds new players into the db and sends message back to client confirming
      players.push({username: data.username, points: 0})
      clients.set(data.username,ws)
      ws.send(JSON.stringify({message: players}))
      ws.send(JSON.stringify({type: 'WaitingScreen'}))
      
      // update host screen
      updateHost('host')
      if(data.username == 'host'){
        ws.send(JSON.stringify({type: 'updateHost'}))
      }


    }
    if(data.type == 'startGame'){
            WhosTurnisIT()
    }
  });

  function WhosTurnisIT(){
    server.clients.forEach((client) => {
        if(client.readyState == WebSocket.OPEN && client !== clients.get("host")){
          const data = {type: 'SelectPlayer' , message: players[playersTurn].username}
          client.send(JSON.stringify(data))
        }
      });
      playersTurn += 1
        
    
  }

  function updateHost(clientId){
    const ws = clients.get(clientId)
    if(ws && ws.readyState == WebSocket.OPEN){
      ws.send(JSON.stringify({type:'updatePlayerBoard', message: players}))
    }
    else{
      console.log(`client ${clientId} not connected`)
    }
  }
  
  ws.on('close', () => {
    console.log('🔴 Client disconnected');
  });
});


