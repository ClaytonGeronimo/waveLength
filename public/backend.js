//const socket = new WebSocket(`ws://${location.host}`);
const socket = new WebSocket(`wss://actinometrical-unseparately-lennox.ngrok-free.dev/`);

socket.onopen = () => {
  console.log('Connected to server');
};

// waits for users to click the ready button
document.getElementById("ready").addEventListener('click', newUser);


// depending on the message of the server this determines the action to take
socket.addEventListener('message', event => {
  const data = JSON.parse(event.data)
  if (data.type == 'MainMenu') {
    removeHostLogin()
    AddStartButton()
  }

  if (data.type == 'updatePlayerBoard') {
    displayPlayers(data.playerList)
  }
  if (data.type == 'waitingScreen') {
    waitingScreen()
  }
  if (data.type == 'SelectPlayer') {
    WhosTurnIsITScreen(data.whosTurn, data.myTurn)
  }
  if (data.type == 'updateClueGiver') {
    updateClueGiver(data.points, data.username, data.whosTurn)

  }
  if(data.type == 'Prompts'){
    displayCards(data.Prompt)
  }
  if (data.type == 'updateGuessers') {
    updateGuessers(data.points, data.username, data.whosTurn)
  }

  if (data.type == 'ClueGiverisReady') {
    waitingScreen()
  }

  if (data.type == 'hostGuessingScreen') {
    addSlider(data.clueVlaue)

  }
  if (data.type == 'guessingScreen') {
    addSlider(data.clueVlaue)
    addConfirmButtn()
  }
  if (data.type == 'allGuessed') {
    evaluationScreen(data.points, data.message, data.myTurn)
  }
})

// gets the username inputed by the user and sends it to the server to add to the list of other players
function newUser() {
  const user = document.getElementById("username").value
  const data = { type: 'login', username: user }
  socket.send(JSON.stringify(data));
}

// updates the player list everytime a new player joins (only on the host screen)
function displayPlayers(data) {
  const targetDiv = document.getElementById('playerNames');
  const logo = document.querySelector('.logo')
  const body = document.querySelector('body')
  body.style.background = 'rgb(6, 77, 87)'
  logo.id = 'lobbyLogo'
  clearplayers()
  data.forEach(player => {
    const newh1 = document.createElement('h1');
    newh1.textContent = `${player.username}: `;
    targetDiv.appendChild(newh1)
  })
}


//displays slider onto the host screen fro everyone to see 
function addSlider(value) {
  const targetDiv = document.querySelector('.spinWheel');
  const pin = document.querySelector('.pin');
  targetDiv.style.display = "flex"
  pin.style.transform = "translate(0, -50%) rotate(270deg)"
  sliderColor(value)
  
}

//adds effects to the slider and its colors 
function sliderColor(start) {
  const wedge1 = document.querySelector('.wedge1')
  const wedge2 = document.querySelector('.wedge2')
  const wedge3 = document.querySelector('.wedge3')
  const wedge4 = document.querySelector('.wedge4')
  const wedge5 = document.querySelector('.wedge5')
  
  wedge1.style.transform = `rotate(${start}deg)`
  wedge2.style.transform = `rotate(${start + 7}deg)`
  wedge3.style.transform = `rotate(${start - 7}deg)`
  wedge4.style.transform = `rotate(${start + 13}deg)`
  wedge5.style.transform = `rotate(${start - 13}deg)`

}

// just a function to clear the players before showing the new set of players
function clearplayers() {
  const targetDiv = document.getElementById('playerNames');
  targetDiv.innerHTML = ''
}

// removes register buttons
function removeHostLogin() {
  const targetDiv = document.querySelector('.loginholder');
  targetDiv.remove()
}

//adds start button for the host 
function AddStartButton() {
  const targetDiv = document.getElementById('body');
  const buttonDiv = document.createElement('div')
  buttonDiv.id = "startbuttonWrapper"
  const startButton = document.createElement('button')
  startButton.type = "submit"
  startButton.id = "startButton"
  startButton.innerHTML = "START GAME"
  buttonDiv.appendChild(startButton)
  targetDiv.appendChild(buttonDiv)
  document.getElementById("startButton").addEventListener('click', () => {
    buttonDiv.remove()
    startGame()
  });

}

const pin = document.querySelector('.pin')
const circle = document.querySelector('.circle4')
let isRotating = false
let angleDeg = 90

document.addEventListener('mousedown', (e) => {
  if (e.target.closest(".pin")) {
    isRotating = true
  }

})

const rotatePin = (e) => {
  if (isRotating) {
    let knobX = circle.getBoundingClientRect()

    let centerX = knobX.left + knobX.width / 2;
    let centerY = knobX.top + knobX.height / 2;

    let deltaX = e.clientX - centerX
    let deltaY = e.clientY - centerY


    let agnleRad = Math.atan2(deltaY, deltaX)
    angleDeg = (agnleRad * 180) / Math.PI

    if (angleDeg < 0) angleDeg += 360;
    if (angleDeg >= 180 && angleDeg <= 360) {
      pin.style.transform = `translate(0, -50%) rotate(${angleDeg}deg)`
    }

  }
}


document.addEventListener('mousemove', rotatePin)
document.addEventListener('mouseup', () => { isRotating = false })

function addConfirmButtn() {
  const targetDiv = document.getElementById("body")
  const slider = document.getElementById("myRange")
  const confirmButton = document.createElement("button")
  const wheelCover = document.querySelector('.circle2')
  confirmButton.id = "confirmButton"
  confirmButton.innerHTML = "Confirm"
  targetDiv.appendChild(confirmButton)

  document.getElementById("confirmButton").addEventListener('click', () => {
    socket.send(JSON.stringify({ type: "guesedVal", value: Math.abs(Math.floor(angleDeg - 180)) }))
    confirmButton.remove()
    waitingScreen()
  });
}


// starts the game
function startGame() {
  const data = { type: "startGame" }
  const time = countDown(3, "WhosTurn", "Game Starts in: ", data, "Starting..")
}

//
function WhosTurnIsITScreen(data, myTurn) {
  const targetTag = document.getElementById('WhosTurn');
  const playerNames = document.getElementById('playerNames')
  playerNames.innerHTML = ''
  targetTag.innerHTML = `${data} turn `


}

function clearwhosTurn() {
  const targetTag = document.getElementById('WhosTurn');
  targetTag.innerHTML = ``
}

function updateStatusBar(points, player, playersTurn) {
  clearwhosTurn()
  const targetDiv = document.getElementById('statusBar')
  targetDiv.innerHTML = ""
  const username = document.createElement('h1')
  username.id = "playerName"
  const playerPoints = document.createElement('h1')
  playerPoints.id = "playerPoints"
  const clueGiver = document.createElement('h1')
  clueGiver.id = "clueGiver"
  if (player == playersTurn) {
    clueGiver.innerHTML = `ClueGiver: You`
  }
  else {
    clueGiver.innerHTML = `ClueGiver: ${playersTurn}`
  }
  username.innerHTML = `user: ${player}`
  playerPoints.innerHTML = `Points: ${points}`
  targetDiv.appendChild(username)
  targetDiv.appendChild(playerPoints)
  targetDiv.appendChild(clueGiver)
}


//update guessers
function updateGuessers(points, player, playersTurn) {
  updateStatusBar(points, player, playersTurn)
}

//update cluegiver screen
function updateClueGiver(points, player, playersTurn) {
  const wheelCover = document.querySelector('.circle2')
  wheelCover.style.animation = ""
  randValue = 1//Math.floor(Math.random() * 181 )
  socket.send(JSON.stringify({ type: "ClueValue", value: randValue }))
  socket.send(JSON.stringify({type: 'GetPrompts'}))
  addSlider(randValue)
  updateStatusBar(points, player, playersTurn)
  addSpinButton()
  addReadyButton(playersTurn)
  displayCards(randValue)

}
function displayCards(prompt){
  const card1 = document.querySelector('.card1')
  const card2 = document.querySelector('.card2')

  card1.innerHTML = prompt[0]
  card2.innerHTML = prompt[1]
}
function addSpinButton(){
  const targetDiv = document.getElementById('body')
  const spinBttn = document.createElement('button')
  const wheel = document.querySelector('.gear-inner')
  const wheelCover = document.querySelector('.circle2')
  spinBttn.innerHTML = 'Spin'

  targetDiv.appendChild(spinBttn)
  spinBttn.addEventListener('click', () => {
    wheel.style.animation = "counter-clockwise 4s forwards"
    setTimeout(() => {
      wheelCover.style.animation = "reveal 3s forwards";
    }, 5000);
    spinBttn.remove()
  })
}

function addReadyButton(playersTurn) {
  const targetDiv = document.getElementById('body')
  const readyBttn = document.createElement('button')
  const wheel = document.querySelector('.spinWheel');
  readyBttn.id = 'readyBttn'
  readyBttn.innerHTML = 'Ready'

  targetDiv.appendChild(readyBttn)
  readyBttn.addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'startGuessing', playersTurn: playersTurn}))
    wheel.style.display = "none"
    readyBttn.remove()
  })
}


// creates a countdown with specified time, text and data to send
function countDown(time, element, text, data, str = '') {
  const targetTag = document.getElementById(element)
  targetTag.style.display = 'block'
  let timeLeft = time
  const timer = setInterval(function () {
    timeLeft -= 1
    targetTag.innerHTML = text + timeLeft.toString()

    if (timeLeft <= 0) {
      clearInterval(timer)
      targetTag.innerHTML = str

      setTimeout(() => { socket.send(JSON.stringify(data)); }, 2000);
      targetTag.style.display = 'none'
    }

  }, 1000)
}
// updates the secreen to waiting screen when users enter the game
function waitingScreen() {
  removeHostLogin()
  const targetDiv = document.getElementById('playerNames')
  targetDiv.innerHTML = ''
  const targetTag = document.getElementById('WhosTurn');
  targetTag.innerHTML = ''

}

function evaluationScreen(points, message, myTurn) {
  const targetTag = document.getElementById('playerPoints')
  targetTag.innerHTML = `Points: ${points}`
  const displayMessage = document.getElementById('playerNames')
  displayMessage.innerHTML = message
  const wheelCover = document.querySelector('.circle2')
  const spinWheel = document.querySelector('.spinWheel');
  const wheel = document.querySelector('.gear-inner')
  
  wheelCover.style.animation = "reveal 3s forwards";
  console.log("hello1")
  if (myTurn) {
    setTimeout(() => { 
      socket.send(JSON.stringify({ type: "startGame" }));
       wheelCover.style.animation = "";
       wheel.style.animation = ""}, 3000);
  }
  else{
    setTimeout(() => {
      wheelCover.style.animation = "";
      spinWheel.style.display = "none"
    }, 3000);
  }

}
