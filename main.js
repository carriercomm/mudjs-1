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
 
  socket.name = socket.remoteAddress + ':' + socket.remotePort 
 
  clients.push(socket);
 
  socket.write('Welcome ' + socket.name + '\n');
  broadcast(socket.name + " joined the game\n", socket);
 
  socket.on('data', function(data) {
    broadcast(socket.name + '> ' + data, socket);
  });
 
  socket.on('end', function() {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + ' left the game.\n');
  });
  
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
