var net              = require('net');
var connection_state = require('./connection_state');

if(process.argv.length != 3) {
  console.log('Syntax: node main.js <port>\n');
  process.exit(1);
} else {
  var port = parseInt(process.argv[2]);
  if(port < 3000 || port > 65535) {
    console.log('Invalid port -- should be between 3000 and 65535.\n');
    process.exit(1);
  }
}

var clients = [];
 
var server = net.createServer(function(socket) {
 
  socket.network_name = socket.remoteAddress + ':' + socket.remotePort 
  socket.input_buffer = ""
  socket.connection_state = connection_state.PLAYING; //change to CONNECTED

  clients.push(socket);
 
  socket.write('Welcome ' + socket.network_name + '\n');
  send_prompt(socket);
  broadcast(socket.network_name + " has connected.\n", socket);
 
  socket.on('data', function(data) {
    socket.input_buffer += data;
    var splits = socket.input_buffer.split("\r\n");
    while(splits.length > 1) {
      receive_line(socket, splits[0]);
      splits.splice(0, 1);
    }
	socket.input_buffer = splits[0];
  });
 
  socket.on('end', function() {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.network_name + ' left the game.\n');
  });

  function receive_line(socket, data) {
    switch(socket.connection_state) {
      case connection_state.CONNECTED:
        break;
      case connection_state.ENTER_PASSWORD:
        break;
      case connection_state.NEW_CHAR_PASSWORD:
        break;
      case connection_state.CONFIRM_PASSWORD:
        break;
      case connection_state.PLAYING:
        broadcast(socket.network_name + '> ' + data + '\n', socket);
        break;
    }
    send_prompt(socket);
  }
 
  function send_prompt(socket) {
    switch(socket.connection_state) {
      case connection_state.CONNECTED:
        socket.write('Please enter your username: ');
        break;
      case connection_state.ENTER_PASSWORD:
        socket.write('Enter your password: ');
        break;
      case connection_state.NEW_CHAR_PASSWORD:
        socket.write('Select a password (>= 6 characters): ');
        break;
      case connection_state.CONFIRM_PASSWORD:
        socket.write('Confirm your password: ');
        break;
      case connection_state.PLAYING:
        socket.write(socket.network_name + '> ');
        break;
    }
  }
  
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      if (client === sender) return;
      client.write(message);
    });
    process.stdout.write(message)
  } 
});

server.listen(port);
console.log('Game running on port ' + port + '\n');
