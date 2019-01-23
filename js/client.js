var Client = {};
Client.socket = io.connect();

Client.socket.on('newplayer', function(data){
    console.log("newplayer:"+data.id);
    Game.addPlayer(data.id, data.x, data.y, data.health, data.name);
});

Client.socket.on('newenemyplayer', function(data){
    console.log("newenemyplayer:"+data.id);
    Game.addNewPlayer(data.id, data.x, data.y, data.health, data.name);
});

Client.socket.on('allplayers', function(data){
    console.log(data);
    for(var i = 0; i<data.length; i++){
        Game.addNewPlayer(data[i].id, data[i].x, data[i].y, data[i].health, data[i].name);
    }
});

Client.socket.on('pong', function(ms){
    console.log(ms+"ms")
})

// Client.socket.on('move', function(data){
//     Game.movePlayer(data.id, data.x, data.y);
// });
Client.socket.on("gameState", function(pack){
    Game.updateState(pack);
})

Client.socket.on('remove', function(id){
    Game.removePlayer(id);
})

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer', 'playerName');
};

Client.moveUp = function(){
    Client.socket.emit('moveUp');
}
Client.moveDown = function(){
    Client.socket.emit('moveDown');
}
Client.moveLeft = function(){
    Client.socket.emit('moveLeft');
}
Client.moveRight = function(){
    Client.socket.emit('moveRight');
}

Client.shoot = function(pointer){
    Client.socket.emit("shoot", pointer);
}

Client.chat = function(){
    Client.socket.emit('chat');
}

Client.socket.on('recieveChat', function(chat){
    Game.showChat(chat);
})