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
    displayPlayers(data.playerName)
  }
  if (data.type == 'waitingScreen') {
    waitingScreen()
  }
  if (data.type == 'SelectPlayer') {
    WhosTurnIsITScreen(data.whosTurn, data.myTurn, data.isHost)
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
  if(data.type == 'openHostCover'){
    const wheelCover = document.querySelector('.circle2')
    wheelCover.style.animation = "reveal 3s forwards";
    const spinWheel = document.querySelector('.spinWheel');
    const cards = document.querySelector('.cardholders')
    setTimeout(() => {
      cards.style.display = "none"
      spinWheel.style.display = "none"
      wheelCover.style.animation = "";
    }, 5000);
  }

  if(data.type == 'removePlayer'){
    removePlayerFromDisplay(data.username)
  }
})

// gets the username inputed by the user and sends it to the server to add to the list of other players
function newUser() {
  const user = document.getElementById("username").value
  const data = { type: 'login', username: user }
  socket.send(JSON.stringify(data));
}

// updates the player list everytime a new player joins (only on the host screen)
function displayPlayers(playerName) {
  const targetDiv = document.getElementById('playerNames');
  targetDiv.style.display = "block"
  updateLogo()

  let colors = ['(154,178,97)','(198,185,142)','(202,146,131)','(207,175,179)','(212,104,42)','(191,136,27)','(41,35,30)','(105,160,128)','(150,179,208)','(242,118,46)','(242,178,13)','(145,210,204)']
  console.log(window.innerHeight)

  let positions = []
  let randomColor = Math.floor(Math.abs(Math.random() * (colors.length)))
  let randomLeft = Math.floor(Math.abs(Math.random()*window.innerWidth-200))
  let randomTop = Math.floor(Math.abs(Math.random()*(693-293) + 293))
  let fontsize = Math.floor(Math.abs(Math.random()*(40-10) + 10))

  while (checkpositions(positions,randomTop,randomLeft)){
    randomLeft = Math.floor(Math.abs(Math.random()*window.innerWidth-200))
    randomTop = Math.floor(Math.abs(Math.random()*(693-293) + 293))
  }
  positions.push([randomTop,randomLeft])

    const playerDiv = document.createElement('div')
    playerDiv.classList.add('LobbyNames')
    playerDiv.style.cssText = 
    `position: absolute; left: ${randomLeft}px;
    top: ${randomTop}px;
    background:rgb${colors[randomColor]};
    font-size: ${fontsize}px;
    border-radius: ${fontsize}px;`;

    const newh1 = document.createElement('h1');
    newh1.textContent = `${playerName}`;
    playerDiv.appendChild(newh1)
    targetDiv.appendChild(playerDiv)

}
function removePlayerFromDisplay(playerName){
  const playernames = document.querySelectorAll('.LobbyNames')
  playernames.forEach((item,i) => {
    if(item.children[0].innerHTML == playerName){
      item.remove()
    }
  })
}
function checkpositions(arr, top, left){ //arr =[[top,left]]
  for(let i = 0; i < arr.length; i++){
    let maxtop = arr[i][0] + 30, mintop = arr[i][0]  - 30
    let maxleft = arr[i][1] + 30, minleft = arr[i][1] - 30
    if(inRange(top,maxtop,maxleft) || inRange(left,maxleft,minleft)){
      return true
    }
  }
  return false
}

function inRange(num,max,min){
  if(num<= max && num >= min){
    return true
  }
  return false
}

function updateLogo(){
  const targetDiv = document.getElementById('playerNames');
  const logo = document.querySelector('.logo')
  const body = document.querySelector('body')
  body.style.cssText = 'background: radial-gradient(circle, rgb(6, 77, 87) 50%, rgba(4, 52, 58, 1));'
  logo.id = 'lobbyLogo'
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
  targetDiv.style.display = 'none'
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
const PinCushon = document.querySelector('.PinCushon')
const circle = document.querySelector('.circle4')
const circle3 = document.querySelector('.circle3')
let isRotating = false
let angleDeg = 90

const getCoords = (e) => {
  if (e.touches) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else {
    return { x: e.clientX, y: e.clientY };
  }
};

const startRotate = (e) => {
  if (e.target.closest(".PinCushon")) {
    isRotating = true;
  }
};

const rotateKnob = (e) => {
  if (!isRotating) return;
  e.preventDefault();
  let knobX = circle.getBoundingClientRect()

  const {x,y} = getCoords(e)

    let centerX = knobX.left + knobX.width / 2;
    let centerY = knobX.top + knobX.height / 2;

    let deltaX = x - centerX
    let deltaY = y - centerY


    let agnleRad = Math.atan2(deltaY, deltaX)
    angleDeg = (agnleRad * 180) / Math.PI

    if (angleDeg < 0) angleDeg += 360;
    if (angleDeg >= 180 && angleDeg <= 360) {
      pin.style.transform = `translate(0, -50%) rotate(${angleDeg}deg)`
      PinCushon.style.transform = `translate(0, -50%) rotate(${angleDeg}deg)`
      console.log(Math.abs(Math.floor(angleDeg - 180)))
    }
};

// Stop rotating
const stopRotate = () => {
  isRotating = false;
};


// Mouse events
document.addEventListener("mousedown", startRotate);
document.addEventListener("mousemove", rotateKnob);
document.addEventListener("mouseup", stopRotate);

// Touch events
document.addEventListener("touchstart", startRotate);
document.addEventListener("touchmove", rotateKnob, { passive: false });
document.addEventListener("touchend", stopRotate);

function addConfirmButtn() {
  const targetDiv = document.getElementById("buttonHolders")
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
function WhosTurnIsITScreen(data, myTurn,isHost) {
  const targetTag = document.getElementById('WhosTurn');
  const playerNames = document.getElementById('playerNames')
  playerNames.style.display = 'none'
  targetTag.innerHTML = `${data} turn `

  if(isHost){
    randomPrompt = Math.floor(Math.random() * 93 )
    addSlider(0)
    socket.send(JSON.stringify({type: 'GetPrompts',line: randomPrompt}))
    const cardHolder = document.querySelector('.cardholders')
    cardHolder.style.display = 'flex'
  }


}

function clearwhosTurn() {
  const targetTag = document.getElementById('WhosTurn');
  targetTag.innerHTML = ``
}

function updateStatusBar(points, player, playersTurn) {
  clearwhosTurn()
  const statusbar = document.getElementById('statusBar')
  const targetDiv = document.getElementById('statusWrapper')
  statusbar.style.display = 'flex'
  statusWrapper.innerHTML = ""
  const username = document.createElement('h1')
  const playerPoints = document.createElement('h1')
  username.id = "playerName"
  playerPoints.id = "playerPoints"
  username.innerHTML = `USER: ${player}`
  playerPoints.innerHTML = `POINTS: ${points}`
  targetDiv.appendChild(username)
  targetDiv.appendChild(playerPoints)
}


//update guessers
function updateGuessers(points, player, playersTurn) {
  updateStatusBar(points, player, playersTurn)
}

//update cluegiver screen
function updateClueGiver(points, player, playersTurn) {
  const wheelCover = document.querySelector('.circle2')
  wheelCover.style.animation = ""
  randValue = Math.floor(Math.random() * 181 )
  socket.send(JSON.stringify({ type: "ClueValue", value: randValue }))
  addSlider(randValue)
  updateStatusBar(points, player, playersTurn)
  addSpinButton(playersTurn)

}
function displayCards(prompt){
  const card1 = document.querySelector('.card1')
  const card2 = document.querySelector('.card2')

  card1.children[0].innerHTML = prompt[0]
  card2.children[0].innerHTML  = prompt[1]
}
function addSpinButton(playersTurn){
  const targetDiv = document.getElementById('buttonHolders')
  const spinBttn = document.createElement('button')
  spinBttn.id = "spinBttn"
  const wheel = document.querySelector('.gear-inner')
  const wheelCover = document.querySelector('.circle2')
  spinBttn.innerHTML = 'Spin'

  targetDiv.appendChild(spinBttn)
  spinBttn.addEventListener('click', () => {
    wheel.style.animation = "counter-clockwise 4s forwards"
    setTimeout(() => {
      wheelCover.style.animation = "reveal 3s forwards";
      addReadyButton(playersTurn)
    }, 5000);
    spinBttn.remove()
  })
}

function addReadyButton(playersTurn) {
  const targetDiv = document.getElementById('buttonHolders')
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
      //targetTag.style.display = 'none'
    }

  }, 1000)
}
// updates the secreen to waiting screen when users enter the game
function waitingScreen() {
  removeHostLogin()
  updateLogo()

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
       wheel.style.animation = ""}, 5000);
  }
  // else{
  //   setTimeout(() => {
  //     wheelCover.style.animation = "";
  //     spinWheel.style.display = "none"
  //   }, 3000);
  // }

}
