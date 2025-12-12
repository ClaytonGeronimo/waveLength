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
  if(data.type == 'updateHostForAllGuessed'){
    updateHostForAllGuessed(data.players.slice(1))
    setTimeout(() => {
      if(data.shotlist.length == 0){
        HostSafeScreen()
      }
      else{
        displayShotList(data.shotlist)
      }
      
    }, 10000);
  }

  if(data.type == 'removePlayer'){
    removePlayerFromDisplay(data.username)
  }
  if(data.type == 'DisplayShotScreen'){
    DisplayShotScreen()
  }
  if(data.type == 'DisplaySafeScreen'){
    DisplaySafeScreen()
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
  const PinCushon = document.querySelector('.PinCushon')
  targetDiv.style.display = "flex"
  pin.style.transform = "translate(0, -50%) rotate(270deg)"
  PinCushon.style.transform = "translate(0, -50%) rotate(270deg)"
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
      //console.log(Math.abs(Math.floor(angleDeg - 180)))
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
  const spinWheel = document.querySelector('.spinWheel')
  confirmButton.id = "confirmButton"
  confirmButton.innerHTML = "Confirm"
  targetDiv.appendChild(confirmButton)

  document.getElementById("confirmButton").addEventListener('click', () => {
    socket.send(JSON.stringify({ type: "guesedVal", value: Math.abs(Math.floor(angleDeg - 180)) }))
    confirmButton.remove()
    // setTimeout(() => {
    //   spinWheel.style.display = 'none'
    // }, 3000);
    // waitingScreen()
  });
}


// starts the game
function startGame() {
  const data = { type: "startGame" }
  const time = countDown(3, "gameStatus", "Game Starts in: ", data, "Starting..")
}

//
function WhosTurnIsITScreen(data, myTurn,isHost) {
  const targetTag = document.getElementById('gameStatus');
  const gameStatusHolder = document.getElementById('gameStatusHolder')
  const gameStatusWrapper = document.getElementById('gameStatusWrapper')
  const playerNames = document.getElementById('playerNames')
  const logo = document.getElementById('lobbyLogo')
  const body = document.querySelector('body')
  playerNames.style.display = 'none'
  targetTag.innerHTML = `${data} turn `

  if(isHost){
    gameStatusHolder.style.cssText = 'margin: 1%; display: block;'
    gameStatusWrapper.style.cssText = 'left: -30%; font-size: 80px; '
    logo.style.display = 'none'
    body.style.cssText = 'background-image: url("../images/AnswerBackground.png")'
    randomPrompt = Math.floor((Math.random() * Date.now()) % 93);
    addSlider(0)
    socket.send(JSON.stringify({type: 'GetPrompts',line: randomPrompt}))
    const cardHolder = document.querySelector('.cardholders')
    cardHolder.style.display = 'flex'
  }


}

function clearwhosTurn() {
  const targetTag = document.getElementById('gameStatus');
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
  const gear = document.querySelector('.gear-inner')
  const wheelCover = document.querySelector('.circle2')
  readyBttn.id = 'readyBttn'
  readyBttn.innerHTML = 'Ready'

  targetDiv.appendChild(readyBttn)
  readyBttn.addEventListener('click', () => {
    gear.style.animation = ""
    wheelCover.style.animation = ""
    socket.send(JSON.stringify({ type: 'startGuessing', playersTurn: playersTurn}));
    wheel.style.display = "none"
    readyBttn.remove()
  })
}


// creates a countdown with specified time, text and data to send
function countDown(time, element, text, data, str = '') {
  const targetTag = document.getElementById(element)
  const gameStatusHolder = document.getElementById("gameStatusHolder")
  gameStatusHolder.style.display = 'block'
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

function updateHostForAllGuessed(players){
  const wheelCover = document.querySelector('.circle2')
    wheelCover.style.animation = "reveal 3s forwards";
    const spinWheel = document.querySelector('.spinWheel');
    const cards = document.querySelector('.cardholders')
    const leaderboard = document.querySelector('.sidebar');
    const gameStatusWrapper = document.getElementById('gameStatusWrapper')
    const background = document.querySelector('body')
    const gamestatus = document.getElementById('gameStatus')
    setTimeout(() => {
      background.style.cssText = `background-image: url("../images/LeaderBoardBackground.png")`
      gamestatus.innerHTML = 'LEADERBOARD'
      gameStatusWrapper.style.cssText ='left: -20%; font-size: 80px; '
      cards.style.display = "none"
      spinWheel.style.display = "none"
      wheelCover.style.animation = "";
      leaderboard.style.display = 'block'
      displayLeaderBoard(players)
    }, 6000);
}


function displayLeaderBoard(players){

    const LeaderboardList = document.querySelector('.list')
    LeaderboardList.innerHTML = '';
    for(let i = 0; i<players.length; i++){
      if(i == 10){
        break
      }
        const playerDiv = document.createElement('div')
        const playerPostiion = document.createElement('div')
        const PlayerScore = document.createElement('div')

        playerDiv.classList.add("list-item")
        playerDiv.dataset.id = i.toString()
        playerDiv.dataset.score = (players[i].points).toString()
        playerDiv.dataset.index = i

        playerPostiion.classList.add("position")
        playerPostiion.innerHTML = `${i+1}` + '. ' + players[i].username

        PlayerScore.classList.add("score")
        PlayerScore.innerHTML = players[i].points

        playerDiv.append(playerPostiion)
        playerDiv.append(PlayerScore)
        LeaderboardList.append(playerDiv)

    }
    document.querySelectorAll('.list-item').forEach((item, i) => {
        item.style.transform = `translateY(${i * 60}px)`;
        item.style.fontSize = `${50 - (i*4)}px`;

    });
      setTimeout(() => { 
         changespots(players)}, 2000);
}



function changespots(players){
    players.sort((a, b) => b.points - a.points);
    const items = document.querySelectorAll(".list-item");
    items.forEach((item, i) => {
    // Find the player this div represents
        const playerName = item.children[0].innerHTML.split(". ")[1]
        const newIndex = players.findIndex(p => p.username === playerName);
        item.children[0].innerHTML = `${newIndex+1}. ${playerName}`
        item.style.transform = `translateY(${newIndex * 60}px)`;
        item.style.fontSize = `${50 - (newIndex*4)}px`;
    });
}

function displayShotList(shotlist){
  body = document.querySelector('body')
  sidebar = document.querySelector('.sidebar')
  sidebar.classList.remove('sidebar')
  sidebar.classList.add('shotlist')
  gamestatus = document.getElementById('gameStatusWrapper')
  shotTimeLogo = document.getElementById('shotTimeLogo')

  shotTimeLogo.style.display = 'block'
  shotTimeLogo.style.backgroundImage = 'url("../images/TakeAShotIcon.png")'
  shotTimeLogo.style.animation = 'popup 1s forwards'


  gamestatus.style.display = 'none'
  body.style.background = 'radial-gradient(circle, rgb(212, 104, 42) 50%, rgba(126, 62, 25, 1))'

  socket.send(JSON.stringify({type: "SafeOrShotScreen"}))

  displayLeaderBoard(shotlist)
  

  setTimeout(() => { 
      shotTimeLogo.style.display = 'none'
      sidebar.classList.remove('shotlist')
      sidebar.classList.add('sidebar')
      sidebar.style.display = 'none'
      socket.send(JSON.stringify({ type: "startGame" }));
       }, 5000);
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
  if (myTurn) {
    wheelCover.style.animation = "";
    wheel.style.animation = ""
  }
  else{
    setTimeout(() => {
      wheelCover.style.animation = "";
      spinWheel.style.display = "none"
    }, 8000);
  }
}

function HostSafeScreen(){
  gameStatusHolder = document.getElementById('gameStatusHolder')
  mainbody = document.querySelector('body')
  body = document.getElementById('body')
  slidebar = document.querySelector('.sidebar')

  gameStatusHolder.style.display = 'none'
  slidebar.style.display = 'none'

  mainbody.style.background = 'radial-gradient(circle, rgb(154, 178, 97) 50%, rgba(112, 129, 70, 1))'

  Safelogo = document.createElement('div')
  Safelogo.id = 'Safelogo'

  setTimeout(() => {
    mainbody.style.background = 'radial-gradient(circle, rgba(6, 77, 87, 1) 50%, rgb(4, 52, 58, 1))'
    socket.send(JSON.stringify({ type: "startGame" }));
    console.log("hello")
  }, 5000);

}

function DisplayShotScreen(){
  logo = document.getElementById('lobbyLogo')
  statusbar = document.getElementById('statusBar')
  mainBody = document.querySelector('body')
  body = document.getElementById('body')

  logo.style.display = 'none'
  statusbar.style.display = 'none'
  mainBody.style.background = 'radial-gradient(circle, rgb(212, 104, 42) 50%, rgba(126, 62, 25, 1))'

  ShotLogoWrapper = document.createElement('div')
  ShotLogoWrapper.id = 'ShotLogoWrapper'
  ShotLogo = document.createElement('h1')
  ShotLogo.id = 'ShotLogo'

  ShotLogo.innerHTML = "WAVELENGTH"

  ShotLogoWrapper.appendChild(ShotLogo)

  gifwrapper = document.createElement('div')
  gifwrapper.id = 'gifwrapper'

  gif = document.createElement('div')
  gif.id = 'gif'

  gif.style.backgroundImage = `url("../images/TaketheL.gif")`
  
  gifwrapper.appendChild(gif)

  
  shotOclockLogoWrapper = document.createElement('div')
  shotOclockLogoWrapper.id = 'shotOclockLogoWrapper'

  shotOclockLogo = document.createElement('img')
  shotOclockLogo.id = 'shotOclockLogo'
  shotOclockLogo.src = "../images/TakeAShotIcon.png"
  shotOclockLogoWrapper.appendChild(shotOclockLogo)

  message = document.createElement('div')
  message.id = 'message'

  message.innerHTML = '🤪 TAKE YOUR SHOT DUDE 🤪'


  body.appendChild(ShotLogoWrapper)
  body.appendChild(gifwrapper)
  body.appendChild(shotOclockLogoWrapper)
  body.appendChild(message)

  setTimeout(() => {
    logo.style.display = 'block'
    statusbar.style.display = 'flex'
    mainBody.style.background = 'radial-gradient(circle, rgba(6, 77, 87, 1) 50%, rgb(4, 52, 58, 1))'

    ShotLogoWrapper.remove()
    gifwrapper.remove()
    shotOclockLogoWrapper.remove()
    message.remove()

  }, 5000);


}

function DisplaySafeScreen(){
  logo = document.getElementById('lobbyLogo')
  statusbar = document.getElementById('statusBar')
  mainBody = document.querySelector('body')
  body = document.getElementById('body')

  logo.style.display = 'none'
  statusbar.style.display = 'none'
  mainBody.style.background = 'radial-gradient(circle, rgb(154, 178, 97) 50%, rgba(112, 129, 70, 1))'

  ShotLogoWrapper = document.createElement('div')
  ShotLogoWrapper.id = 'ShotLogoWrapper'
  ShotLogo = document.createElement('h1')
  ShotLogo.id = 'ShotLogo'

  ShotLogo.innerHTML = "WAVELENGTH"

  ShotLogoWrapper.appendChild(ShotLogo)

  gifwrapper = document.createElement('div')
  gifwrapper.id = 'gifwrapper'

  gif = document.createElement('div')
  gif.id = 'gif'

  gif.style.backgroundImage = `url("../images/SafeGif.gif")`
  
  gifwrapper.appendChild(gif)


  message = document.createElement('div')
  message.id = 'safeMessage'

  message.innerHTML = 'YOU ARE SAFE\n ✋😌 \nNO SHOT FOR YOU'


  body.appendChild(ShotLogoWrapper)
  body.appendChild(gifwrapper)
  body.appendChild(message)

  setTimeout(() => {
    logo.style.display = 'block'
    statusbar.style.display = 'flex'
    mainBody.style.background = 'radial-gradient(circle, rgba(6, 77, 87, 1) 50%, rgb(4, 52, 58, 1))'

    ShotLogoWrapper.remove()
    gifwrapper.remove()
    message.remove()

  }, 5000);
}
