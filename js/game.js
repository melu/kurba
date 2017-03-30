var Game = {};

var upKey;
var downKey;
var leftKey;
var rightKey;

Game.init = function(){
    game.stage.disableVisibilityChange = true;
}

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.spritesheet('onyx', 'assets/sprites/qgzlX80.png',32,32);
    game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
};

Game.create = function(){
    Game.playerMap = {};
    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    //layer.inputEnabled = true; // Allows clicking on the map
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

    Client.askNewPlayer();
};

Game.movePlayer = function(id, x, y){
    var player = Game.playerMap[id];
    
    //left
    if(player.x>x){
        player.animations.play('right');
        player.anchor.setTo(1, .5);
    }

    //right
    if(player.x<x){
        player.animations.play('right');
    }

    //down
    if(player.y>y){
        player.animations.play('down');
    }

    //up
    if(player.y<y){
        player.animations.play('up');
    }

    player.x = x;
    player.y = y;
}

Game.update = function(){
    if (upKey.isDown)
    {
        Client.moveUp();
    }
    else if (downKey.isDown)
    {
        Client.moveDown();
    }

    if (leftKey.isDown)
    {
        Client.moveLeft();
    }
    else if (rightKey.isDown)
    {
        Client.moveRight();
    }
}

Game.addNewPlayer = function(id, x, y){
    Game.playerMap[id] = game.add.sprite(x,y,'onyx');
    Game.playerMap[id].animations.add('down', [109, 110, 111], 1, false);
    Game.playerMap[id].animations.add('right', [0, 1], 1, false);
    Game.playerMap[id].animations.add('up', [58, 59, 60], 1, false);
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
}

var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById("game"));
game.state.add('Game', Game);
game.state.start('Game');
