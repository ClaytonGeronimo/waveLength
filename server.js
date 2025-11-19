// server.js

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { json } = require('stream/consumers');

const filePath = 'public/Prompts.txt'

const wss = new WebSocket.Server({ server });
let lines = null


fs.readFile(filePath,'utf8', (err,data) => {
  if(err){
    console.error("error reading file", err)
    return
  }
  
  lines = data.split(/\r?\n/)

})






const clients = new Map()
const players = []
playersTurn = 1
isHost = true
clueVlaue = null
let statusBarUpdated = false;

wss.on('connection', ws => {
  console.log('🟢 New client connected'); 

  // determines the action to take given a message send from client side
  ws.on('message', message => {
    const data = JSON.parse(message);
    if (data.type == 'login'){
      newClient(data.username)
    }
    if(data.type == 'startGame'){
      WhosTurnisIT()
    }
    if(data.type == 'updateStatusBar'){
      updateStatusBar()
    }
    if(data.type == 'startGuessing'){
      startGuessing(data.playersTurn)
    }
    if(data.type == 'ClueValue'){
      clueVlaue = data.value
    }
    if(data.type == 'GetPrompts'){
      ws.send(JSON.stringify({type: 'Prompts', Prompt: null }))//JSON.parse(lines[clueVlaue - 1])
    }
    if(data.type == 'guesedVal'){
      updateGuess(data.value)
    }
  });

  function newClient(username){
    if(username == 'host'){
      players.push({username: username, points: 0, guess: null, clientID: ws, guessed: false})
      clients.set(username,ws)
      clients.get('host').send(JSON.stringify({type: 'MainMenu'}))
      clients.get('host').send(JSON.stringify({type: 'updatePlayerBoard', playerList: players}))
    }
    else{
      players.push({username: username, points: 0, guess: null, clientID: ws, guessed: false})
      clients.set(username,ws)
      ws.send(JSON.stringify({type: "waitingScreen"}))
      clients.get('host').send(JSON.stringify({type: 'updatePlayerBoard' , playerList: players}))
    }
     
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

  function WhosTurnisIT(){
    let CurrPlayer = 0
    wss.clients.forEach((client) => {
      
      const data = {type: 'SelectPlayer', username: players[CurrPlayer].username, whosTurn: players[playersTurn].username, points: players[CurrPlayer].points}
      client.send(JSON.stringify(data))
      CurrPlayer += 1
    });
    setTimeout(() => {updateStatusBar()}, 2000);

      
  }

  function updateStatusBar(){

    let CurrPlayer = 0
    wss.clients.forEach((client) => {
      if(client != clients.get('host')){
        if(CurrPlayer == playersTurn){
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

  }

  function startGuessing(playersTurn){
    wss.clients.forEach((client) => {
      if(client == clients.get(playersTurn))
      {
        const data = {type: 'ClueGiverisReady'}
        client.send(JSON.stringify(data))
      }
      else if(client == clients.get('host')){
        const data = {type: 'hostGuessingScreen', clueVlaue: clueVlaue }
        client.send(JSON.stringify(data))
      }
      else{
        const data = {type: 'guessingScreen', clueVlaue: clueVlaue, playersTurn: playersTurn}
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
      let threePoints = (players[i].guess == clueVlaue || (players[i].guess >= clueVlaue - 3 && players[i].guess <= clueVlaue + 2 ))
      let twoPoints = ((players[i].guess < clueVlaue -3 && players[i].guess >= clueVlaue - 9) || (players[i].guess >= clueVlaue + 3 && players[i].guess <= clueVlaue + 8))
      let onePoint = ((players[i].guess >= clueVlaue - 16 && players[i].guess < clueVlaue - 9) || (players[i].guess > clueVlaue + 8 && players[i].guess <= clueVlaue + 16) )
      
      if(i==0){
        players[i].clientID.send(JSON.stringify({type: 'openHostCover'}))
      }
      if(i != playersTurn && i != 0){
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
            players[i].clientID.send(JSON.stringify({type: 'allGuessed',points: players[i].points, message: "Your Safe!", myTurn: false}))
          }

          else {
            players[i].clientID.send(JSON.stringify({type: 'allGuessed',points: players[i].points, message: "Drink up buddy", myTurn: false  }))
          }
      }

    }

    
    players[playersTurn].points += cluegiverGainedPoints
    if(cluegiverGainedPoints == 0){
      players[playersTurn].clientID.send(JSON.stringify({type: 'allGuessed',points: players[playersTurn].points, message: "Drink up buddy", myTurn: true  }))
    }
    else{
      players[playersTurn].clientID.send(JSON.stringify({type: 'allGuessed',points: players[playersTurn].points, message: "well done!", myTurn: true  }))
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

  function removePlayer(){
    for(let i = 0; i < players.length; i++ ){
      if(players[i].clientID == ws){
        players.splice(i,1)
      }
    }
  }
  

  ws.on('close', () => {
    console.log('🔴 Client disconnected');
    removePlayer()
  });
});
app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, '0.0.0.0', () => {
  console.log("✅ Listening on all interfaces (e.g. http://192.168.x.x:3000)");
});




