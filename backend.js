 const socket = new WebSocket('ws://localhost:8080');

      socket.onopen = () => {
        console.log('Connected to server');
      };

      document.getElementById("ready").addEventListener('click', newUser);

      function newUser(){
        const data = {type: 'login', username: document.getElementById("username").value}
        socket.send(JSON.stringify(data));
      }
      socket.onmessage = event => {
          console.log('Message from server:', event.data);
        };  

      socket.addEventListener('message', event => {
        const data = JSON.parse(event.data)

        console.log('message from server:', data.message)
        console.log('adevenlisten')
        // const targetDiv = document.getElementById('playerNames');
        // const newh1 = document.createElement('h1');
        // newh1.textContent = 'player ${ser.message}'
        // targetDiv.appendChild(newh1)
      })

      