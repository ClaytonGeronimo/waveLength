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
clueVlaue = null
let statusBarUpdated = false;
let shotlist = []


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
      ws.send(JSON.stringify({type: 'Prompts', Prompt: JSON.parse(lines[data.line - 1]) }))//JSON.parse(lines[clueVlaue - 1])
    }
    if(data.type == 'guesedVal'){
      updateGuess(data.value)
    }
    if(data.type == 'SafeOrShotScreen'){
      SafeOrShotScreen()
    }
  });

  function newClient(username){
    if(username == 'host'){
      players.push({username: username, points: 0, guess: null, clientID: ws, guessed: false, message: null})
      clients.set(username,ws)
      clients.get('host').send(JSON.stringify({type: 'MainMenu'}))
      clients.get('host').send(JSON.stringify({type: 'updatePlayerBoard', playerName: username}))
    }
    else{
      players.push({username: username, points: 0, guess: null, clientID: ws, guessed: false,  message: null})
      clients.set(username,ws)
      ws.send(JSON.stringify({type: "waitingScreen"}))
      clients.get('host').send(JSON.stringify({type: 'updatePlayerBoard' , playerName: username}))
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
    let host = false;

    for(let i = 0; i < players.length; i++){
      if(players[i].clientID == clients.get('host')){
        host = true;
      }
      const data = {type: 'SelectPlayer',isHost: host, username: players[CurrPlayer].username, whosTurn: players[playersTurn].username, points: players[CurrPlayer].points}
      players[i].clientID.send(JSON.stringify(data))
      CurrPlayer += 1
      host = false;
    }
      
    setTimeout(() => {updateStatusBar()}, 2000);

      
  }

  function updateStatusBar(){

    let CurrPlayer = 0
    for(let i = 0; i < players.length; i++){
      if(players[i].clientID != clients.get('host')){
        if(CurrPlayer == playersTurn){
          const data = {type: 'updateClueGiver', username: players[CurrPlayer].username, whosTurn: players[playersTurn].username, points: players[CurrPlayer].points}
          players[i].clientID.send(JSON.stringify(data))
        }
        else{
            const data = {type: 'updateGuessers', username: players[CurrPlayer].username, whosTurn: players[playersTurn].username, points: players[CurrPlayer].points}
            players[i].clientID.send(JSON.stringify(data))
        }
      }
      CurrPlayer += 1
    }

  }

  function startGuessing(playersTurn){

    for(let i = 0; i < players.length; i++){
      if(players[i].clientID == clients.get(playersTurn))
      {
        const data = {type: 'ClueGiverisReady'}
        players[i].clientID.send(JSON.stringify(data))
      }
      else if(players[i].clientID == clients.get('host')){
        const data = {type: 'hostGuessingScreen', clueVlaue: clueVlaue }
        players[i].clientID.send(JSON.stringify(data))
      }
      else{
        const data = {type: 'guessingScreen', clueVlaue: clueVlaue, playersTurn: playersTurn}
        players[i].clientID.send(JSON.stringify(data))
      }
    }

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
    shotlist = []
    for(let i = 0; i < players.length; i++){
      let threePoints = (players[i].guess == clueVlaue || (players[i].guess >= clueVlaue - 3 && players[i].guess <= clueVlaue + 2 ))
      let twoPoints = ((players[i].guess < clueVlaue -3 && players[i].guess >= clueVlaue - 9) || (players[i].guess >= clueVlaue + 3 && players[i].guess <= clueVlaue + 8))
      let onePoint = ((players[i].guess >= clueVlaue - 16 && players[i].guess < clueVlaue - 9) || (players[i].guess > clueVlaue + 8 && players[i].guess <= clueVlaue + 16) )
      
      
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
            players[i].clientID.send(JSON.stringify({type: 'allGuessed',points: players[i].points, message: "Safe", myTurn: false}))
            players[i].message = "Safe"
          }

          else {
            players[i].clientID.send(JSON.stringify({type: 'allGuessed',points: players[i].points, message: "Drink", myTurn: false  }))
            players[i].message = "Drink"
            shotlist.push({...players[i]})
          }
      }

    }


    players[playersTurn].points += cluegiverGainedPoints
    if(cluegiverGainedPoints == 0){
      players[playersTurn].clientID.send(JSON.stringify({type: 'allGuessed',points: players[playersTurn].points, message: "Drink", myTurn: true  }))
      players[playersTurn].message = "Drink"
      shotlist.push({...players[playersTurn]})
    }
    else{
      players[playersTurn].clientID.send(JSON.stringify({type: 'allGuessed',points: players[playersTurn].points, message: "Safe", myTurn: true  }))
      players[playersTurn].message = "Safe"
    }

    if(playersTurn == players.length-1){
        playersTurn = 0
      }
    playersTurn += 1
    clients.get('host').send(JSON.stringify({type: 'updateHostForAllGuessed', players: players, shotlist: shotlist}))
    
  }

  function setGuessesFalse(){
    for(let i = 0; i < players.length; i++){
      players[i].guessed = false
    }
  }

  function removePlayer(){
    for(let i = 0; i < players.length; i++ ){
      if(players[i].clientID == ws){
        clients.get('host').send(JSON.stringify({type:'removePlayer', username: players[i].username}))
        players.splice(i,1)

      }
    }

  }
  
  function SafeOrShotScreen(){
    players.forEach(player =>{
      if(player.username != 'host'){
        console.log(player.message)
          if(player.message == 'Drink'){
          player.clientID.send(JSON.stringify({type: 'DisplayShotScreen'}))
        }
        else if(player.message == 'Safe'){
          player.clientID.send(JSON.stringify({type: 'DisplaySafeScreen'}))
        }
      }
      
    })
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



