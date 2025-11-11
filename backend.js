 const socket = new WebSocket('ws://localhost:8080');

      socket.onopen = () => {
        console.log('Connected to server');
      };

      // waits for users to click the ready button
      document.getElementById("ready").addEventListener('click', newUser);


      // depending on the message of the server this determines the action to take
      socket.addEventListener('message', event => {
        const data = JSON.parse(event.data)
        if(data.type == 'updatePlayerBoard'){
          displayPlayers(data.message)
        }
        if(data.type == 'updateHost'){
          removeHostLogin()
          AddStartButton()
        }
        if(data.type == 'WaitingScreen'){
          waitingScreen()
        }
        if(data.type == 'SelectPlayer'){
          WhosTurnIsITScreen(data.whosTurn)
        }
        if(data.type == 'updateClueGiver'){
          updateClueGiver(data.points, data.username, data.whosTurn)

        }
        if(data.type == 'updateGuessers'){
          updateGuessers(data.points, data.username, data.whosTurn)
        }

        if(data.type == 'ClueGiverisReady'){
          waitingScreen()
        }

        if(data.type == 'hostGuessingScreen'){
          addSlider(50, "no")
          
        }
        if(data.type == 'guessingScreen'){
          addSlider(50, "no")
          addConfirmButtn()
        }
        if(data.type == 'allGuessed'){
          evaluationScreen(data.points,data.message)
        }
      })

      // gets the username inputed by the user and sends it to the server to add to the list of other players
      function newUser(){
        const user = document.getElementById("username").value
        const data = {type: 'login', username: user}
        socket.send(JSON.stringify(data));
      }

      // updates the player list everytime a new player joins (only on the host screen)
      function displayPlayers(data){
        const targetDiv = document.getElementById('playerNames');
        clearplayers()
        data.forEach(player => {
          const newh1 = document.createElement('h1');
          newh1.textContent = `${player.username}: `;
          targetDiv.appendChild(newh1)
        })  
      }


      //displays slider onto the host screen fro everyone to see 
      function addSlider(value = 50, color = 'yes'){
        const targetDiv = document.getElementById('playerNames');
        targetDiv.innerHTML = ''
        const newInput = document.createElement('input');
        newInput.type = "range"
        newInput.min = "1"
        newInput.max = "100"
        newInput.value =  value.toString()
        newInput.id = "myRange" 
        newInput.classList.add("slider")
        targetDiv.appendChild(newInput)

        if(color == "yes"){
          sliderColor(randValue)
        }
        //return randValue
      }

      //adds effects to the slider and its colors 
      function sliderColor(start){
        const targetTag = document.getElementById('myRange')
        targetTag.style.background = `linear-gradient(
        to right,
        #EDE3C5 0%,
        #EDE3C5 ${start-4}%,
        yellow ${start-4}%,
        yellow ${start-3}%,
        rgb(245, 65, 10) ${start-3}%,
        rgb(245, 65, 10) ${start-2}%,
        lightblue ${start-2}%,
        lightblue ${start+1}%,
        rgb(245, 65, 10) ${start+1}%,
        rgb(245, 65, 10) ${start+2}%,
        yellow ${start+2}%,
        yellow ${start+3}%,
        #EDE3C5 ${start+3}%,
        #EDE3C5 100%
  )`
        
      }

      // just a function to clear the players before showing the new set of players
      function clearplayers(){
        const targetDiv = document.getElementById('playerNames');
        targetDiv.innerHTML = ''
      }

      // removes register buttons
      function removeHostLogin(){
        const targetDiv = document.getElementById('login');
        targetDiv.innerHTML = ''
      }

      //adds start button for the host 
      function AddStartButton(){
        const targetDiv = document.getElementById('body');
        const startButton = document.createElement('button')
        startButton.type = "submit"
        startButton.id = "startButton"
        startButton.innerHTML = "START GAME"
        targetDiv.appendChild(startButton)
        document.getElementById("startButton").addEventListener('click', () => {
          startButton.remove()
          startGame()});

      }

      function addConfirmButtn(){
        const targetDiv = document.getElementById("body")
        const slider = document.getElementById("myRange")
        const confirmButton = document.createElement("button")
        confirmButton.id = "confirmButton"
        confirmButton.innerHTML = "Confirm"
        targetDiv.appendChild(confirmButton)

        document.getElementById("confirmButton").addEventListener('click', () => {
          socket.send(JSON.stringify({type: "guesedVal", value: slider.value}))
          confirmButton.remove()
          waitingScreen()
        });
      }


      // starts the game
      function startGame(){
        const data = {type: "startGame"}
        const time = countDown(3,"WhosTurn","Game Starts in: ", data, "Starting..")
      }

      //
      function WhosTurnIsITScreen(data){
        const targetTag = document.getElementById('WhosTurn');
        const playerNames = document.getElementById('playerNames')
        playerNames.innerHTML = ''
        targetTag.innerHTML = `${data} turn `

      }

      function clearwhosTurn(){
        const targetTag = document.getElementById('WhosTurn');
        targetTag.innerHTML = ``
      }

      function updateStatusBar(points,player,playersTurn){
        clearwhosTurn()
        const targetDiv = document.getElementById('statusBar')
        targetDiv.innerHTML = ""
        const username = document.createElement('h1')
        username.id = "playerName"
        const playerPoints = document.createElement('h1')
        playerPoints.id = "playerPoints"
        const clueGiver = document.createElement('h1')
        clueGiver.id = "clueGiver"
        if(player == playersTurn){
          clueGiver.innerHTML = `ClueGiver: You`
        }
        else{
          clueGiver.innerHTML = `ClueGiver: ${playersTurn}`
        }
        username.innerHTML = `user: ${player}`
        playerPoints.innerHTML = `Points: ${points}`
        targetDiv.appendChild(username)
        targetDiv.appendChild(playerPoints)
        targetDiv.appendChild(clueGiver)
      }


      //update guessers
      function updateGuessers(points,player,playersTurn){
        updateStatusBar(points,player,playersTurn)
      }

      //update cluegiver screen
      function updateClueGiver(points,player,playersTurn){
        randValue = 50//Math.floor(Math.random() * 87 )
        addSlider(randValue)
        updateStatusBar(points,player,playersTurn)
        addReadyButton(playersTurn)
        socket.send(JSON.stringify({type: "ClueValue", value: randValue}))
        
      }

      function addReadyButton(playersTurn){
        const targetDiv = document.getElementById('body')
        const readyBttn = document.createElement('button')
        readyBttn.id = 'readyBttn'
        readyBttn.innerHTML = 'Ready'

        targetDiv.appendChild(readyBttn)
        readyBttn.addEventListener('click', () => {
          socket.send(JSON.stringify({type: 'startGuessing', playersTurn: playersTurn}))
          readyBttn.remove()
        })
      }


      // creates a countdown with specified time, text and data to send
      function countDown(time,element,text,data, str = ''){
        const targetTag = document.getElementById(element)
        let timeLeft = time
        const timer = setInterval(function(){ timeLeft -= 1
          targetTag.innerHTML = text + timeLeft.toString()

          if (timeLeft <= 0){
            clearInterval(timer)
            targetTag.innerHTML = str

            setTimeout(() => {socket.send(JSON.stringify(data));}, 2000);
          }
          
        },1000)
      }
      // updates the secreen to waiting screen when users enter the game
      function waitingScreen(){
        removeHostLogin()
        const targetDiv = document.getElementById('playerNames')
        targetDiv.innerHTML = ''
        const targetTag = document.getElementById('WhosTurn');
        targetTag.innerHTML = ''

      }

      function evaluationScreen( points, message){
        const targetTag = document.getElementById('playerPoints')
        targetTag.innerHTML = `Points: ${points}`
        const displayMessage = document.getElementById('playerNames')
        displayMessage.innerHTML = message

        setTimeout(() => {socket.send(JSON.stringify({type: "startGame"}));}, 2000);

      }

      