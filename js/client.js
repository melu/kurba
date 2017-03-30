var Client = {};
Client.socket = io.connect();

Client.socket.on('newplayer', function(data){
    Game.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on('allplayers', function(data){
    console.log(data);
    for(var i = 0; i<data.length; i++){
        Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
    }
});

Client.socket.on('move', function(data){
    Game.movePlayer(data.id, data.x, data.y);
});

Client.socket.on('remove', function(id){
    Game.removePlayer(id);
})

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
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