// server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });
const clients = new Map()
const players = []
playersTurn = 1
isHost = true
clueVlaue = null

server.on('connection', ws => {
  console.log('🟢 New client connected'); 

  // determines the action to take given a message send from client side
  ws.on('message', message => {
    const data = JSON.parse(message);
    if (data.type == 'login'){
      // adds new players into the db and sends message back to client confirming
      if(data.username == 'host'){
        ws.send(JSON.stringify({type: 'updateHost'}))
        players.push({username: data.username, points: 0, guess: null, clientID: ws, guessed: false})
        clients.set(data.username,ws)
      }
      else{ 
        players.push({username: data.username, points: 0,guess: null, clientID: ws, guessed: false})
        clients.set(data.username,ws)
        ws.send(JSON.stringify({message: players}))
        ws.send(JSON.stringify({type: 'WaitingScreen'}))
      }
      updateHost('host')

      
    }
    if(data.type == 'startGame'){
            WhosTurnisIT()
    }
    if(data.type == 'startGuessing'){
      startGuessing(data.playersTurn)
    }
    if(data.type == 'ClueValue'){
      clueVlaue = data.value
    }
    if(data.type == 'guesedVal'){
        updateGuess(data.value)
    }
  });



  function updateHost(clientId){
    const ws = clients.get(clientId)
    if(ws && ws.readyState == WebSocket.OPEN){
      ws.send(JSON.stringify({type:'updatePlayerBoard', message: players}))
    }
    else{
      console.log(`client ${clientId} not connected`)
    }
  }

  function WhosTurnisIT(){
    let CurrPlayer = 0
    server.clients.forEach((client) => {
      
      const data = {type: 'SelectPlayer', username: players[CurrPlayer].username, whosTurn: players[playersTurn].username, points: players[CurrPlayer].points}
      client.send(JSON.stringify(data))
    });

      setTimeout(() => {updateStatusBar()}, 2000);
      
  }

  function updateStatusBar(){
    let CurrPlayer = 0
    server.clients.forEach((client) => {
      if(client != clients.get('host')){
        if(client == players[playersTurn].clientID){
          const data = {type: 'updateClueGiver', username: players[CurrPlayer].username, whosTurn: players[playersTurn].username, points: players[CurrPlayer].points}
          client.send(JSON.stringify(data))
        }
        else{
            const data = {type: 'updateGuessers', username: players[CurrPlayer].username, whosTurn: players[playersTurn].username, points: players[CurrPlayer].points}
            client.send(JSON.stringify(data))
        }
      }
      CurrPlayer += 1
      });
      CurrPlayer = 0
  }

  function startGuessing(playersTurn){
    server.clients.forEach((client) => {
      if(client == clients.get(playersTurn))
      {
        const data = {type: 'ClueGiverisReady'}
        client.send(JSON.stringify(data))
      }
      else if(client == clients.get('host')){
        const data = {type: 'hostGuessingScreen'}
        client.send(JSON.stringify(data))
      }
      else{
        const data = {type: 'guessingScreen'}
        client.send(JSON.stringify(data))
      }
    })
  }
  
  function updateGuess(value){
    for(let i = 0; i < players.length; i++){
      if(ws == players[i].clientID){
        players[i].guess = value
        players[i].guessed = true
        if(checkAllGuessed()){
          updatepoints()
          setGuessesFalse()
        }
      }
    }
  }

  function checkAllGuessed(){
    for(let i = 0; i < players.length; i++){
      if(players[i].username != 'host' && i != playersTurn){
        if(players[i].guessed == false){
          
          return false
        }
      }
    }
    return true
  }


  function updatepoints(pointsgained){
    let cluegiverGainedPoints = 0
    
    for(let i = 0; i < players.length; i++){
      let threePoints = (players[i].guess == clueVlaue)
      let twoPoints = (players[i].guess == clueVlaue + 1 || players[i].guess == clueVlaue - 1)
      let onePoint = (players[i].guess == clueVlaue + 2 || players[i].guess == clueVlaue - 2)
      
      if(i != playersTurn){

        if(threePoints || twoPoints || onePoint){
          if(threePoints){
              players[i].points += 3
              cluegiverGainedPoints += 1
            }
            else if(twoPoints){
              players[i].points += 2
              cluegiverGainedPoints += 1
            }
            else if(onePoint){
              players[i].points += 1
              cluegiverGainedPoints += 1
            }
            players[i].clientID.send(JSON.stringify({type: 'allGuessed',points: players[i].points, message: "Your Safe!"  }))
          }

          else {
            players[i].clientID.send(JSON.stringify({type: 'allGuessed',points: players[i].points, message: "Drink up buddy"  }))
          }
      }

    }

    
    
    players[playersTurn].points += cluegiverGainedPoints
    if(cluegiverGainedPoints == 0){
      players[playersTurn].clientID.send(JSON.stringify({type: 'allGuessed',points: players[playersTurn].points, message: "Drink up buddy"  }))
    }
    else{
      players[playersTurn].clientID.send(JSON.stringify({type: 'allGuessed',points: players[playersTurn].points, message: "well done!"  }))
    }

    if(playersTurn == players.length-1){
        playersTurn = 0
      }
      playersTurn += 1
    
  }

  function setGuessesFalse(){
    for(let i = 0; i < players.length; i++){
      players[i].guessed = false
    }
  }


  ws.on('close', () => {
    console.log('🔴 Client disconnected');
  });
});


