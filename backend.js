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
          WhosTurnIsITScreen(data.message)
          console.log(data)
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
      function addSlider(){
        let randValue = Math.floor(Math.random() * 87 )
        const targetDiv = document.getElementById('playerNames');
        const newInput = document.createElement('input');
        newInput.type = "range"
        newInput.min = "1"
        newInput.max = "100"
        newInput.value =  randValue.toString()
        newInput.id = "myRange" 
        newInput.classList.add("slider")
        targetDiv.appendChild(newInput)
        sliderColor(randValue)
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
        document.getElementById("startButton").addEventListener('click', startGame);

      }

      // starts the game
      function startGame(){
        const data = {type: "startGame"}
        socket.send(JSON.stringify(data))
      }

      function WhosTurnIsITScreen(data){
        const targetDiv = document.getElementById('body');
        const playerTrun = document.createElement('h1')
        playerTrun.innerHTML = `${data} turn `
        targetDiv.appendChild(playerTrun)

      }
      // updates the secreen to waiting screen when users enter the game
      function waitingScreen(){
        removeHostLogin()
        addSlider()
      }

      