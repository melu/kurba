var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(8081,function(){ // Listens to port 8081
    console.log('Listening on '+server.address().port);
});

server.lastPlayderID = 0;

io.on('connection', function(socket){
    socket.on('newplayer', function(){
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),
            y: randomInt(100,400)
        };

        socket.emit('newplayer', socket.player);
        socket.emit('allplayers', getAllPlayers(socket));
        io.emit('newenemyplayer', socket.player);

        var VELOCITY = 5;
        socket.on('moveUp', function(){
            socket.player.y-=VELOCITY;
            io.emit('move', socket.player);
        });
        socket.on('moveDown', function(){
            socket.player.y+=5;
            io.emit('move', socket.player);
        });
        socket.on('moveLeft', function(){
            socket.player.x-=VELOCITY;
            io.emit('move', socket.player);
        });
        socket.on('moveRight', function(){
            socket.player.x+=VELOCITY;
            io.emit('move', socket.player);
        });

        // gestionamos la desconexion
        socket.on('disconnect', function(){
            io.emit('remove', socket.player.id);
        });
    });

});

function getAllPlayers(socket){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketId){
        if(socket.id != socketId){
            var player = io.sockets.connected[socketId].player;
            if(player) players.push(player);
        }
    });
    return players;
}

function randomInt(low, high){
    return Math.floor(Math.random() * (high - low) + low);
}