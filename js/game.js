'use strict';
class BgLayers {
    constructor(image, speedModifier) {
        this.x = 0;
        this.y = 0;
        // this.width = 928;
        // this.height = 793;
        this.image = image;
        this.speedModifier = speedModifier.toFixed(1);
        this.speed = (game.gameSpeed * this.speedModifier).toFixed(1);
    }
    update() {
        if (this.x <= -(window.innerHeight * 1.17)) {
            this.x = 0;
        }
        this.x = Math.floor(this.x - this.speed);
    }
    draw() {
        game.ctx.drawImage(this.image, this.x, this.y, Math.floor(window.innerHeight * 1.17), window.innerHeight);
        game.ctx.drawImage(this.image, this.x + (Math.floor(window.innerHeight * 1.17)), this.y, Math.floor(window.innerHeight * 1.17), window.innerHeight);
    }
}

class Boxes {
    constructor(x, y, width, height) {
        this.xpos = x;
        this.ypos = y;
        this.width = width;
        this.height = height;
    }
    update() {
        game.ctx.fillStyle = 'white';
        game.ctx.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}

class HitBoxes extends Boxes {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.typeBox = 'hit';
    }
}

class HeartBoxes extends Boxes {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.typeBox = 'heart';
    }
    inflictDamage() {
        game.ctx.clearRect(0,0, game.canvas.width, game.canvas.height);
    }
    isCollision(hitbox, heartbox) {
        if (hitbox.xpos + hitbox.width >= heartbox.xpos) {
                return true;
            }
    }
}

class Mushrooms extends HeartBoxes {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.speed = game.gameSpeed + 2;
        this.alive = true;
    }
    update() {
        this.xpos = Math.floor(this.xpos - this.speed);
        super.update();
    }
    inflictDamage(heartbox) {
        this.alive = false;
        setTimeout(()=>{
            game.enemies.displayedEnem.splice( game.enemies.displayedEnem.indexOf(heartbox),1);
            super.inflictDamage();
        },450);
    }
}

let game = {
    canvas: null,
    ctx: null,
    gameSpeed: 1,
    background: {
        value: 11,
        layers: []
    },
    sprites: {
        player: {
            adventurer: null,
            staggerFrames:10,
            gameFrame: 0,
            actionMap: {
                runFrames: 6,
                run: [
                    {x:1, y:1},
                    {x:2, y:1},
                    {x:3, y:1},
                    {x:4, y:1},
                    {x:5, y:1},
                    {x:6, y:1}
                ],
                jumpFrames: 10,
                countJumpFrames: 0,
                staggerJumpFrames:10,
                jump: [
                    {x:0, y:2},
                    {x:1, y:2},
                    {x:2, y:2},
                    {x:3, y:2},
                    {x:4, y:2},
                    {x:5, y:2},
                    {x:6, y:2},
                    {x:0, y:3},
                    {x:1, y:3},
                    {x:2, y:3}
                ],
                attackFrames: 4,
                countAttackFrames: 0,
                staggerAttackFrames:10,
                attack: [
                    {x:4, y:7},
                    {x:5, y:7},
                    {x:6, y:7},
                    {x:0, y:8}
                ]
            }
        },
        enemies: {
            staggerFrames: 10,
            idleFrames: 4,
            countIdleFrames: 0,
            countDeathFrames: 0,
            mushroom: {
                idle: null,
                takeHit: null,
                death: null
            },
            flyingEye: {
                flight: null,
                takeHit: null,
                death: null,
                attack: null
            }
        },
        spells: {
            magicArrows: {
                value: 29,
                first: null,
                second: null,
                third: null
            }
        }
    },
    player: {
        actionDelay: {
            jump: true,
            attack: true
        },
        jump() {
            this.actionDelay.jump = false;
            let startPoint = this.heartBox.ypos;
            let up = setInterval(()=>{
                if(startPoint - this.heartBox.ypos <= Math.floor((game.canvas.height*0.088)*3)) {
                    this.heartBox.ypos -= Math.floor(((game.canvas.height*0.088)*3)/5);
                } 
            },150);
            setTimeout(()=> {
                clearInterval(up);
                let down = setInterval(()=>{
                    if(startPoint > this.heartBox.ypos) {
                        this.heartBox.ypos += Math.floor(((game.canvas.height*0.088)*3)/5);
                    } else {
                        clearInterval(down);
                        this.actionDelay.jump = true;
                        game.sprites.player.actionMap.countJumpFrames = 0;
                    }
                },150);
            },750);
        },
        attack() {
            this.actionDelay.attack = false;
            this.hitBox = new HitBoxes(this.heartBox.xpos + this.heartBox.width, this.heartBox.ypos, 
                this.heartBox.width/2, this.heartBox.height);
            setTimeout(()=>{
            this.hitBox.update();
            game.enemies.displayedEnem.forEach(enemy => {
                if (enemy.isCollision(this.hitBox, enemy) && this.heartBox.xpos + this.heartBox.width < enemy.xpos) {
                    enemy.inflictDamage(enemy);
                }
            });
            },450);
            setTimeout(()=>{
                this.actionDelay.attack = true;
                game.sprites.player.actionMap.countAttackFrames = 0;
            },600);
        }
    },
    enemies: {
        displayedEnem: []
    },
    init() {
        this.canvas = document.querySelector('#mycanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerHeight * 1.17;
        this.canvas.height = window.innerHeight;

    },
    preload() {
        this.init();
        for (let i = 1; i <= this.background.value; i++) {
            let layer = new Image();
            layer.src = `img/Background layers/layer_${i}.png`;
            this.background.layers.push(layer);
        }
        this.preloadSpells();
        this.preloadPlayer();
        this.preloadEnemies();
        this.parallax.createLayers();
        this.player.heartBox = new HeartBoxes(Math.floor(game.canvas.width*0.1), Math.floor((game.canvas.height*0.088)*9.5), Math.floor(this.canvas.height * 0.09 * 1.32), Math.floor(this.canvas.height * 0.09));
        this.spawnEnemies();
        window.addEventListener('keyup', e => {
            if (e.keyCode == '32' && this.player.actionDelay.jump) {
                game.player.jump();
            } 
            if (e.keyCode == '65' && this.player.actionDelay.jump && this.player.actionDelay.attack) {
                game.player.attack();
            }
        });
    },
    spawnEnemies() {
        setInterval(()=>{
            this.enemies.displayedEnem.push(new Mushrooms(Math.floor(game.canvas.width), Math.floor((game.canvas.height*0.088)*9.5), Math.floor(this.canvas.height * 0.09 * 0.61), Math.floor(this.canvas.height * 0.09)));
        },2000);
    },
    renderEnemies() {
        this.enemies.displayedEnem.forEach( enemie => {
            if (enemie.alive) {
                let position =  Math.floor(this.sprites.enemies.countIdleFrames/this.sprites.enemies.staggerFrames) % this.sprites.enemies.idleFrames;
                let frameX = 22.5 * position;
                let frameY = 0;
                game.ctx.drawImage(game.sprites.enemies.mushroom.idle, frameX, frameY,
                22.5, 37, enemie.xpos, enemie.ypos, enemie.width, enemie.height);
            } else {
                let position = Math.floor(game.sprites.enemies.countDeathFrames/game.sprites.enemies.staggerFrames) % game.sprites.enemies.idleFrames;
                console.log(this.sprites.enemies.countDeathFrames);
                let frameX = 25 * position;
                let frameY = 0;
                game.ctx.drawImage(game.sprites.enemies.mushroom.death, frameX, frameY,
                    23, 37, enemie.xpos, enemie.ypos, enemie.width, enemie.height);
                game.sprites.enemies.countDeathFrames++;
            }
        });
        if (this.sprites.enemies.countDeathFrames >= 27) {
            this.sprites.enemies.countDeathFrames = 0;
        }
        this.sprites.enemies.countIdleFrames++;
    },
    preloadPlayer() {
        this.sprites.player.adventurer = new Image();
        this.sprites.player.adventurer.src = 'img/adventurer/adventurer.png';
    },
    preloadEnemies() {
        for (let key in this.sprites.enemies) {
            for (let action in this.sprites.enemies[key]) {
                this.sprites.enemies[key][action] = new Image();
                this.sprites.enemies[key][action].src = `img/${key}/${action}.png`;
            }
        }
    },
    preloadSpells() {
        for (let key in this.sprites.spells.magicArrows) {
            if (key != 'value') {
                this.sprites.spells.magicArrows[key] = [];
                for (let i = 0; i <= this.sprites.spells.magicArrows.value; i++) {
                    let spellSprite = new Image();
                    spellSprite.src = `img/magicArrows/${key}/1_${i}.png`;
                    this.sprites.spells.magicArrows[key].push(spellSprite);
                }
            }
        }
    },
    render() {
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        game.parallax.animateParallax();
        game.player.heartBox.update();
        game.actionPlayerUpdate();
        game.enemies.displayedEnem.forEach( enemie =>{
            enemie.update();
        });
        game.renderEnemies();
        requestAnimationFrame(game.render);
    },
    actionPlayerUpdate() {
        if (this.player.actionDelay.jump == false) {
            let position = Math.floor(this.sprites.player.actionMap.countJumpFrames/this.sprites.player.actionMap.staggerJumpFrames) % this.sprites.player.actionMap.jumpFrames;
            let frameX = 50 * game.sprites.player.actionMap.jump[position].x;
            let frameY = game.sprites.player.actionMap.jump[position].y * 37;
            game.ctx.drawImage(game.sprites.player.adventurer, frameX, frameY,
                50, 37, this.player.heartBox.xpos*0.8, this.player.heartBox.ypos*0.95, this.player.heartBox.width*1.5, this.player.heartBox.height*1.5);
            this.sprites.player.actionMap.countJumpFrames++;
        } else if (this.player.actionDelay.attack == false) {
            let position = Math.floor(this.sprites.player.actionMap.countAttackFrames/this.sprites.player.actionMap.staggerAttackFrames) % this.sprites.player.actionMap.attackFrames;
            let frameX = 50 * game.sprites.player.actionMap.attack[position].x;
            let frameY = game.sprites.player.actionMap.attack[position].y * 37;
            game.ctx.drawImage(game.sprites.player.adventurer, frameX, frameY,
                50, 37, this.player.heartBox.xpos*0.8, this.player.heartBox.ypos*0.95, this.player.heartBox.width*1.5, this.player.heartBox.height*1.5);
            this.sprites.player.actionMap.countAttackFrames++;
        } else {
            let position = Math.floor(this.sprites.player.gameFrame/this.sprites.player.staggerFrames) % this.sprites.player.actionMap.runFrames;
            let frameX = 50 * game.sprites.player.actionMap.run[position].x;
            let frameY = this.sprites.player.actionMap.run[position].y * 37;
            game.ctx.drawImage(this.sprites.player.adventurer, frameX, frameY,
                50, 37, this.player.heartBox.xpos*0.8, this.player.heartBox.ypos*0.95, this.player.heartBox.width*1.5, this.player.heartBox.height*1.5);
            this.sprites.player.gameFrame++;
        }
    },
    parallax: {
        parallaxLayers: null,
        createLayers() {
            this.parallaxLayers = [];
            let speedIncrease = game.gameSpeed;
            for (let layer in game.background.layers) {
                let parallaxLayer = new BgLayers(game.background.layers[layer], speedIncrease);
                this.parallaxLayers.push(parallaxLayer);
                speedIncrease += 0.2;
            }
        },
        animateParallax(){
            game.parallax.parallaxLayers.forEach(layer => {
                layer.update();
                layer.draw();
            });
        },
    }
};
game.preload();
game.render();
