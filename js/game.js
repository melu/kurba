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
    game.load.image('red', 'assets/sprites/red.png');
    game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');

    // game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
};

Game.create = function(){
    Game.playerMap = {};
    Game.objectList = [];
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

    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

    Client.askNewPlayer();
};

Game.updateState = function(pack){
    for(var playerIndex in pack.players){
        var player = pack.players[playerIndex];
        Game.updatePlayer(player);
    }

    for(var objectIndex in pack.objects){
        var object = pack.objects[objectIndex];
        if(!Game.objectList[object.id] && !object.destroy){
            Game.addObject(object.id, object.x, object.y);
        }else{
            if(object.destroy){
                Game.removeObject(object.id);
            }else{
                Game.objectList[object.id].x = object.x;
                Game.objectList[object.id].y = object.y;
            }
        }
    }
}

Game.gameOverPopup = function () {

}

Game.updatePlayer = function(newPlayerState){
    if(Game.playerMap && Game.playerMap[newPlayerState.id]){
        var player = Game.playerMap[newPlayerState.id];
        
        //left
        if(player.x>newPlayerState.x){
            player.animations.play('right');
            player.scale.x = -1;
        }
        
        //right
        if(player.x<newPlayerState.x){
            player.animations.play('right');
            player.scale.x = 1;
        }
        
        //down
        if(player.y<newPlayerState.y){
            player.animations.play('down');
            player.scale.x = 1;
        }
        
        //up
        if(player.y>newPlayerState.y){
            player.animations.play('up');
            player.scale.x = 1;
        }

        if(newPlayerState.health <= 0){
            player.tint = "#808080";
        }

        player.x = newPlayerState.x;
        player.y = newPlayerState.y;
        player.health = newPlayerState.health;

        var porcentaje = player.health > 0 ? player.health : 0;
        if(player.barraVida){
            player.barraVida.x = player.x - (100-porcentaje)/2;
            player.barraVida.y = player.y - 20;
            player.barraVida.width = porcentaje;
            
        }
        
        if(player.barraVidaRestante){
            player.barraVidaRestante.x = player.x + (porcentaje/2);
            player.barraVidaRestante.y = player.y - 20;
            player.barraVidaRestante.width = 100 - porcentaje;   
        }

        if(player.nombre){
            player.nombre.x = player.x - (player.nombre.textWidth / 2);
            player.nombre.y = player.y - 40;
        }
    }
}

// player input
Game.update = function(){
    if (upKey.isDown || wKey.isDown)
    {
        Client.moveUp();
    }
    else if (downKey.isDown || sKey.isDown)
    {
        Client.moveDown();
    }

    if (leftKey.isDown || aKey.isDown)
    {
        Client.moveLeft();
    }
    else if (rightKey.isDown || dKey.isDown)
    {
        Client.moveRight();
    }
}

Game.addPlayer = function(id, x , y, health, name){
    //add our player and set the camera
    Game.playerMap[id] = game.add.sprite(x,y,'onyx');
    Game.playerMap[id].animations.add('up', [114, 113, 112], 30, false);
    Game.playerMap[id].animations.add('down', [57, 58, 60], 30, false);
    Game.playerMap[id].animations.add('right', [0, 1], 30, false);
    Game.playerMap[id].anchor.setTo(.5, .5);
    Game.player = Game.playerMap[id];
    game.physics.enable(Game.player);
    Game.playerMap[id].health = health;
    Game.playerMap[id].name = name;
    console.log(Game.player);

    game.camera.height = 600;
    game.camera.width = 600;
    game.camera.setSize(600,600);
    game.camera.bounds = (0,0,600,600);
    game.camera.follow(Game.player);
    // game.camera.follow(Game.player, Phaser.Camera.FOLLOW_TOPDOWN, 0.5, 0.5);
    // futuro calculo en proporcion de la vida
    var porcentaje = 100;
    // Game.playerMap[id].barraVida = Game.crearBarraVida(x,y,porcentaje, false);
    Game.playerMap[id].nombre = Game.crearNombre(x,y-20, name);
    Game.playerMap[id].barraVida = Game.crearBarraVida(x,y, porcentaje, false);
    Game.playerMap[id].barraVidaRestante = Game.crearBarraVida(x+porcentaje,y,100, true);
    

    game.input.onDown.add(function(pointer){
        console.log(pointer);
        console.log(pointer.worldX)
        console.log(pointer.worldY)
        Client.shoot({x:pointer.worldX, y:pointer.worldY});
    }, this);
}

Game.crearBarraVida = function(x, y, health, danio) {
    var drawnObject;
    var width = health // example;
    var height = 5 // example;
    var bmd = game.add.bitmapData(width, height);
    
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, width, height);
    bmd.ctx.fillStyle = (danio)?'#FF0000':'#00FF00';
    bmd.ctx.fill();
    drawnObject = game.add.sprite(x, y, bmd);
    drawnObject.anchor.setTo(0.5, 0.5);
    return drawnObject;
}

Game.crearNombre = function(x , y, nombre) {
    console.log(nombre)
    bmpText = game.add.bitmapText(x-16, y, 'carrier_command', nombre, 10);
    return bmpText;
}

Game.addNewPlayer = function(id, x, y, health, name){
    //we add a player if it isn't our player.
    if(Game.playerMap[id] != Game.player){
        Game.playerMap[id] = game.add.sprite(x,y,'onyx');
        Game.playerMap[id].animations.add('up', [114, 113, 112], 30, false);
        Game.playerMap[id].animations.add('down', [57, 58, 60], 30, false);
        Game.playerMap[id].animations.add('right', [0, 1], 30, false);
        Game.playerMap[id].anchor.setTo(.5, .5);

        var porcentaje = 100;
        // Game.playerMap[id].barraVida = Game.crearBarraVida(x,y,porcentaje, false);
        Game.playerMap[id].barraVida = Game.crearBarraVida(x,y,porcentaje, false);
        Game.playerMap[id].barraVidaRestante = Game.crearBarraVida(x+porcentaje,y,100, true);
        Game.playerMap[id].nombre = Game.crearNombre(x,y-20, name);

        Game.playerMap[id].health = health;
        Game.playerMap[id].name = name;
    }
};

Game.addObject = function(id, x, y){
    Game.objectList[id] = game.add.sprite(x,y,'red');
    // emitter = game.add.emitter(x, y, 200);
    // emitter.setScale(0,0);
    // emitter.gravity = 0;
    // emitter.makeParticles('red');
    // emitter.start(false, 1000, 10);
    // Game.objectList[id] = emitter;

    Game.objectList[id].width=40;
    Game.objectList[id].height=40;
    Game.objectList[id].anchor.setTo(.5, .5);
}

Game.removePlayer = function(id){
    //we remove a player
    if(Game.playerMap[id].barraVida) Game.playerMap[id].barraVida.destroy();
    if(Game.playerMap[id].barraVidaRestante) Game.playerMap[id].barraVidaRestante.destroy();
    if(Game.playerMap[id].nombre) Game.playerMap[id].nombre.destroy();

    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
}

Game.removeObject = function(id){
    Game.objectList[id].destroy();
    delete Game.objectList[id];
}

var game = new Phaser.Game(600, 600, Phaser.AUTO, document.getElementById("game"));
// game.physics.startSystem(Phaser.Physics.P2JS);
// game.world.setBounds(0, 0, 1920, 1920);
game.state.add('Game', Game);
game.state.start('Game');
