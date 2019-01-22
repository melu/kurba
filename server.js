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
var OBJECT_LIST = [];
var BULLET_SPEED = 5;

io.on('connection', function(socket){
    socket.on('newplayer', function(){
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),
            y: randomInt(100,400),
            velocity:10,
            size:32,
            health:100,
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
            var angle = Math.atan2(pointer.y - socket.player.y, pointer.x - socket.player.x);
            var velocityX = Math.cos(angle) * BULLET_SPEED;
            var velocityY = Math.sin(angle) * BULLET_SPEED;

            var bullet = {
                id:Math.random(),
                ownerId: socket.player.id,
                x: socket.player.x,
                y: socket.player.y,
                size:5,
                vx:velocityX,
                vy:velocityY,
                damage: 10,
                timer:0,
                destroy:false,
                updatePosition: function(){
                    if(!this.destroy) {                    
                        this.x+=this.vx;
                        this.y+=this.vy;
                        this.timer++;
                        if(this.timer>100){
                            this.destroy = true;
                        }

                        var playerCollision = collideWithPlayer(this);
                        if(playerCollision) {
                            playerCollision.health -= this.damage;
                            this.destroy = true;
                        }
                    }
                }
            };
            OBJECT_LIST.push(bullet)
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

function collideWithPlayer(object) {
    var playerCollision = null;
    Object.keys(io.sockets.connected).some(function(socketId){
        var socket = io.sockets.connected[socketId];
        if(socket.player && object.ownerId !== socket.player.id){

            var rect1 = {
                x: socket.player.x - socket.player.size,
                y: socket.player.y - socket.player.size,
                height: socket.player.size * 2,
                width: socket.player.size * 2
            };
            var rect2 = {
                x: object.x - object.size,
                y: object.y - object.size,
                height: object.size * 2,
                width: object.size * 2
            };

                if (rect1.x < rect2.x + rect2.width &&
                        rect1.x + rect1.width > rect2.x &&
                        rect1.y < rect2.y + rect2.height &&
                        rect1.height + rect1.y > rect2.y){
                            playerCollision = socket.player;
                            return socket.player;
                        }
        }
    });
    return playerCollision;
}

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
    var pack = {
        players:[],
        objects:[]
    }

    for(var objectIndex in OBJECT_LIST){
        var object = OBJECT_LIST[objectIndex];
        if(object.destroy){
            delete OBJECT_LIST[objectIndex];
            OBJECT_LIST.splice(objectIndex, 1);
        }

        object.updatePosition();
    }
    // OBJECT_LIST.forEach(object => {
    //     // console.log(object);
    //     object.updatePosition();
    //     if(object.destroy){
    //         console.log("delete:"+object.id);
    //         console.log("delete timer:"+object.timer);
    //         delete object; 
    //         console.log("post-delete");
    //     }
    // });

    pack.objects = OBJECT_LIST;

    Object.keys(io.sockets.connected).forEach(function(socketId){
        var socket = io.sockets.connected[socketId];
        if(socket.player){
            socket.player.updatePosition();
            pack.players.push(socket.player);
        }
    });

    io.emit("gameState", pack);
}, 1000/25);