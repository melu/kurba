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
            y: randomInt(100,400),
            velocity:10,
            _moveUp:false,
            _moveDown:false,
            _moveLeft:false,
            _moveRight:false,
        };

        socket.emit('newplayer', socket.player);
        socket.emit('allplayers', getAllPlayers(socket));
        io.emit('newenemyplayer', socket.player);
        
        socket.on('moveUp', function(){
            socket.player._moveUp=true;
        });
        socket.on('moveDown', function(){
            socket.player._moveDown=true;
        });
        socket.on('moveLeft', function(){
            socket.player._moveLeft=true;
        });
        socket.on('moveRight', function(){
            socket.player._moveRight=true;
        });

        socket.on('shoot', function(pointer){
            console.log(pointer);
        })

        socket.player.updatePosition = function(){
            if(socket.player._moveUp) socket.player.y -= socket.player.velocity;
            if(socket.player._moveDown) socket.player.y += socket.player.velocity;
            if(socket.player._moveLeft) socket.player.x -= socket.player.velocity;
            if(socket.player._moveRight) socket.player.x += socket.player.velocity;

            socket.player._moveUp = false;
            socket.player._moveDown = false;
            socket.player._moveLeft = false;
            socket.player._moveRight = false;
        }

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

setInterval(function(){
    Object.keys(io.sockets.connected).forEach(function(socketId){
        var socket = io.sockets.connected[socketId];
        if(socket.player){
            socket.player.updatePosition();
            io.emit('move', socket.player);
        }
    });    
}, 1000/25);