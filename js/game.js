var Game = {};

var player;

var upKey;
var downKey;
var leftKey;
var rightKey;

Game.init = function(){
    game.stage.disableVisibilityChange = true;
}

Game.preload = function() {
    // game.load.image('background','assets/map/debug-grid-1920x1920.png');
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.spritesheet('onyx', 'assets/sprites/qgzlX80.png',32,32);
    // game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
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
    
    player.scale.x = 1;
    //left
    if(player.x>x){
        player.animations.play('right');
        player.scale.x = -1;
    }

    //right
    if(player.x<x){
        player.animations.play('right');
    }

    //down
    if(player.y<y){
        player.animations.play('down');
    }

    //up
    if(player.y>y){
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

Game.addPlayer = function(id, x , y){
    //add our player and set the camera
    Game.playerMap[id] = game.add.sprite(x,y,'onyx');
    Game.playerMap[id].animations.add('up', [114, 113, 112], 30, false);
    Game.playerMap[id].animations.add('down', [57, 58, 60], 30, false);
    Game.playerMap[id].animations.add('right', [0, 1], 30, false);
    Game.playerMap[id].anchor.setTo(.5, .5);
    Game.player = Game.playerMap[id];
    game.physics.enable(Game.player);
    console.log(Game.player);

    game.camera.height = 600;
    game.camera.width = 600;
    game.camera.setSize(600,600);
    game.camera.bounds = (0,0,600,600);
    game.camera.follow(Game.player);
    // game.camera.follow(Game.player, Phaser.Camera.FOLLOW_TOPDOWN, 0.5, 0.5);
    // console.log(game.camera.follow)
}

Game.addNewPlayer = function(id, x, y){
    //we add a player if it isn't our player.
    if(Game.playerMap[id] != Game.player){
        Game.playerMap[id] = game.add.sprite(x,y,'onyx');
        Game.playerMap[id].animations.add('up', [114, 113, 112], 30, false);
        Game.playerMap[id].animations.add('down', [57, 58, 60], 30, false);
        Game.playerMap[id].animations.add('right', [0, 1], 30, false);
        Game.playerMap[id].anchor.setTo(.5, .5);
    }
};

Game.removePlayer = function(id){
    //we remove a player
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
}

var game = new Phaser.Game(600, 600, Phaser.AUTO, document.getElementById("game"));
// game.physics.startSystem(Phaser.Physics.P2JS);
// game.world.setBounds(0, 0, 1920, 1920);
game.state.add('Game', Game);
game.state.start('Game');
