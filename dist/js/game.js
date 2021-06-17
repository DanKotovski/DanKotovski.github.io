'use strict';

const startBtn = document.querySelector('.start-screen__button');
const startScreen = document.querySelector('.start-screen');
class BgLayers {
    constructor(image, speedModifier) {
        this.x = 0;
        this.y = 0;
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
        // game.ctx.fillStyle = 'white';
        // game.ctx.fillRect(this.xpos, this.ypos, this.width, this.height);
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
        if (hitbox.xpos + hitbox.width > heartbox.xpos &&
            hitbox.xpos < heartbox.xpos + (heartbox.width/3) &&
            hitbox.ypos + hitbox.height > heartbox.ypos) {
                return true;
            }
    }
}

class Mushrooms extends HeartBoxes {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.speed = game.gameSpeed + 2;
        this.alive = true;
        this.type = 'mushroom';
    }
    update() {
        this.xpos = Math.floor(this.xpos - this.speed);
        super.update();
    }
    inflictDamage(heartbox) {
        this.alive = false;
        game.player.playerScore += 1;
        game.sounds.enemyDamage.load();
        game.sounds.enemyDamage.play();
        setTimeout(()=>{
            game.enemies.displayedEnem.splice( game.enemies.displayedEnem.indexOf(heartbox),1);
            game.sprites.enemies.countDeathFrames = 0;
            super.inflictDamage();
        },450);
    }
}

class FlyingEye extends HeartBoxes {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.speed = game.gameSpeed + 2;
        this.alive = true;
        this.type = 'eye';
    }
    update() {
        this.xpos = Math.floor(this.xpos - this.speed);
        super.update();
    }
    inflictDamage(heartbox) {
        this.alive = false;
        game.player.playerScore += 2;
        game.sounds.enemyDamage.load();
        game.sounds.enemyDamage.play();
        setTimeout(()=>{
            game.enemies.displayedEnem.splice( game.enemies.displayedEnem.indexOf(heartbox),1);
            game.sprites.enemies.countEyeDeathFrames = 0;
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
            referenceKey: ['A','Space'],
            playerActions: ['attack', 'jump'],
            spriteKey: [],
            heart: null,
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
            mushroomIdleFrames: 4,
            eyeIdleFrames: 8,
            eyeDeathFrames:4,
            countEyeDeathFrames:0,
            countIdleFrames: 0,
            countDeathFrames: 0,
            mushroom: {
                idle: null,
                death: null
            },
            flyingEye: {
                flight: null,
                death: null,
                attack: null
            },
            demon: {
                idle: null,
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
    sounds: {
        mainTheme: null,
        sword: null,
        enemyDamage: null,
        jump: null,
        bossTheme: null,
        heroDies: null,
        heroHurt: null
    },
    player: {
        playerScore: 0,
        playerLives: 3,
        displayedLives: [],
        actionDelay: {
            jump: true,
            attack: true
        },
        actionPlayerUpdate() {
            if (this.actionDelay.jump == false) {
                let position = Math.floor(game.sprites.player.actionMap.countJumpFrames/game.sprites.player.actionMap.staggerJumpFrames) % game.sprites.player.actionMap.jumpFrames;
                let frameX = 50 * game.sprites.player.actionMap.jump[position].x;
                let frameY = game.sprites.player.actionMap.jump[position].y * 37;
                game.ctx.drawImage(game.sprites.player.adventurer, frameX, frameY,
                    50, 37, this.heartBox.xpos*0.8, this.heartBox.ypos*0.95, this.heartBox.width*1.5, this.heartBox.height*1.5);
                game.sprites.player.actionMap.countJumpFrames++;
            } else if (this.actionDelay.attack == false) {
                let position = Math.floor(game.sprites.player.actionMap.countAttackFrames/game.sprites.player.actionMap.staggerAttackFrames) % game.sprites.player.actionMap.attackFrames;
                let frameX = 50 * game.sprites.player.actionMap.attack[position].x;
                let frameY = game.sprites.player.actionMap.attack[position].y * 37;
                game.ctx.drawImage(game.sprites.player.adventurer, frameX, frameY,
                    50, 37, this.heartBox.xpos*0.8, this.heartBox.ypos*0.95, this.heartBox.width*1.5, this.heartBox.height*1.5);
                game.sprites.player.actionMap.countAttackFrames++;
            } else {
                let position = Math.floor(game.sprites.player.gameFrame/game.sprites.player.staggerFrames) % game.sprites.player.actionMap.runFrames;
                let frameX = 50 * game.sprites.player.actionMap.run[position].x;
                let frameY = game.sprites.player.actionMap.run[position].y * 37;
                game.ctx.drawImage(game.sprites.player.adventurer, frameX, frameY,
                    50, 37, this.heartBox.xpos*0.8, this.heartBox.ypos*0.95, this.heartBox.width*1.5, this.heartBox.height*1.5);
                game.sprites.player.gameFrame++;
            }
        },
        jump() {
            this.actionDelay.jump = false;
            let startPoint = this.heartBox.ypos;
            game.sounds.jump.load();
            game.sounds.jump.volume = '0.1';
            game.sounds.jump.play();
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
                this.heartBox.width/1.5, this.heartBox.height);
            setTimeout(()=>{
            this.hitBox.update();
            game.sounds.sword.load();
            game.sounds.sword.play();
            game.enemies.displayedEnem.forEach(enemy => {
                if (enemy.isCollision(this.hitBox, enemy) && this.heartBox.xpos + this.heartBox.width < enemy.xpos) {
                    enemy.inflictDamage(enemy);
                }
            });
            if (game.demon.heartBox.isCollision(this.hitBox, game.demon.heartBox)) {
                game.demon.takeDamage();
            }
            },450);
            setTimeout(()=>{
                this.actionDelay.attack = true;
                game.sprites.player.actionMap.countAttackFrames = 0;
            },600);
        },
        takeDamage() {
            this.displayedLives.pop();
            game.sounds.heroHurt.load();
            game.sounds.heroHurt.volume = '0.2';
            game.sounds.heroHurt.play();
        }
    },
    enemies: {
        displayedEnem: []
    },
    demon: {
        bossFight: false,
        countIdleFrames: 0,
        countAttackFrames: 0,
        attackFrames: 11,
        idleFrames: 6,
        attackDelay: true,
        attackAction: false,
        lives: 3,
        spawn() {
            let targetXPos = Math.floor(game.canvas.width*0.7);
            this.heartBox = new HeartBoxes(game.canvas.width, Math.floor((game.canvas.height*0.088)*7), Math.floor(game.canvas.height * 0.18 * 1.11 * 2), Math.floor(game.canvas.height * 0.18 * 2));
            let demonInterval = setInterval(()=>{
                if (this.heartBox.xpos > targetXPos) {
                    this.heartBox.xpos -= game.canvas.width*0.05;
                } else {
                    clearInterval(demonInterval);
                }
            }, 150);
        },
        render() {
            if (this.attackAction == true) {
                let position =  Math.floor(this.countAttackFrames/game.sprites.enemies.staggerFrames) % this.attackFrames;
                let frameX = 240 * position;
                let frameY = 0;
                let xpos = Math.floor((this.heartBox.width*1.5) - (this.heartBox.width));
                let ypos = Math.floor((this.heartBox.height*1.33) - (this.heartBox.height));
                game.ctx.drawImage(game.sprites.enemies.demon.attack, frameX, frameY,
                240, 192, this.heartBox.xpos - xpos, this.heartBox.ypos - ypos, Math.floor(this.heartBox.width*1.5), Math.floor(this.heartBox.height*1.33));
                this.countAttackFrames ++;
            } else {
                let position =  Math.floor(this.countIdleFrames/game.sprites.enemies.staggerFrames) % this.idleFrames;
                let frameX = 160 * position;
                let frameY = 0;
                game.ctx.drawImage(game.sprites.enemies.demon.idle, frameX, frameY,
                160, 144, this.heartBox.xpos, this.heartBox.ypos, this.heartBox.width, this.heartBox.height);
                this.countIdleFrames ++;
            }
        },
        attack() {
            this.attackDelay = false;
            let startPos = this.heartBox.xpos;
            let charge = setInterval(()=>{
                if (this.heartBox.xpos > game.player.heartBox.xpos + game.player.heartBox.width) {
                    this.heartBox.xpos -= game.canvas.width*0.05;
                } else {
                    clearInterval(charge);
                    this.attackAction = true;
                    setTimeout(()=>{
                        this.hitBox = new HitBoxes(Math.floor(game.canvas.width*0.1), Math.floor((game.canvas.height*0.088)*9.5), 
                        Math.floor(game.canvas.height * 0.09 * 1.32), Math.floor(game.canvas.height * 0.09));
                        if (game.player.heartBox.ypos + game.player.heartBox.height >= this.hitBox.ypos) {
                            game.player.takeDamage();
                        }
                        setTimeout(()=>{
                            this.countAttackFrames = 0;
                            this.attackAction = false;
                            let backMove = setInterval(()=>{
                                if (this.heartBox.xpos < startPos) {
                                    this.heartBox.xpos += game.canvas.width*0.05;
                                } else {
                                    clearInterval(backMove);
                                    this.attackDelay = true;
                                }
                            },150);
                        },450);
                    },1150);
                }
            },150);
        },
        takeDamage(){
            this.lives --;
            if (this.lives == 0) {
                game.gameOver();
            }
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
            this.parallaxLayers.forEach(layer => {
                layer.update();
                layer.draw();
            });
        },
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
        this.preloadSounds();
        this.parallax.createLayers();
        this.player.heartBox = new HeartBoxes(Math.floor(this.canvas.width*0.1), Math.floor((this.canvas.height*0.088)*9.5), Math.floor(this.canvas.height * 0.09 * 1.32), Math.floor(this.canvas.height * 0.09));
        this.spawnEnemies();
        window.addEventListener('keyup', e => {
            if (e.keyCode == '32' && this.player.actionDelay.jump) {
                this.player.jump();
            } 
            if (e.keyCode == '65' && this.player.actionDelay.jump && this.player.actionDelay.attack) {
                this.player.attack();
            }
        });
    },
    spawnEnemies() {
        let spawnInterval = setInterval(()=>{
            if (this.demon.bossFight) {
                clearInterval(spawnInterval);
            }
            let spawnChance = Math.random();
            if (spawnChance > 0.33) {
                this.enemies.displayedEnem.push(new Mushrooms(Math.floor(this.canvas.width), Math.floor((this.canvas.height*0.088)*9.5), Math.floor(this.canvas.height * 0.09 * 0.61), Math.floor(this.canvas.height * 0.09)));
            } else {
                this.enemies.displayedEnem.push(new FlyingEye(Math.floor(this.canvas.width), Math.floor((this.canvas.height*0.088)*9.5), Math.floor(this.canvas.height * 0.09 * 1.31), Math.floor(this.canvas.height * 0.09)));
            }
        },3000);
    },
    preloadPlayer() {
        this.sprites.player.adventurer = new Image();
        this.sprites.player.adventurer.src = 'img/adventurer/adventurer.png';
        this.sprites.player.heart = new Image();
        this.sprites.player.heart.src = 'img/referenceBar/heart.png';
        for (let i = 0; i < this.sprites.player.referenceKey.length; i++) {
            this.sprites.player.spriteKey.push(new Image());
            this.sprites.player.spriteKey[i].src = `img/referenceBar/${this.sprites.player.referenceKey[i]}-Key.png`;
        }
        for (let i = 1; i <= this.player.playerLives; i++) {
            this.player.displayedLives.push(this.sprites.player.heart);
        }
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
    preloadSounds(){
        for (let key in this.sounds) {
            this.sounds[key] = new Audio();
            this.sounds[key].src = `sounds/${key}.mp3`;
        }
    },
    render() {
        this.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        this.parallax.animateParallax();
        this.player.heartBox.update();
        this.player.actionPlayerUpdate();
        this.renderReferenceBar();
        this.enemies.displayedEnem.forEach( enemie =>{
            enemie.update();
        });
        this.renderEnemies();
        if (this.demon.bossFight) {
            this.demon.heartBox.update();
            this.demon.render();
            
        }
        if (this.player.displayedLives == false) {
            this.gameOver();
        } else {
            window.requestAnimationFrame(()=>{
                this.render();
            });
        }
    },
    gameOver(){
        this.sounds.heroDies.load();
        this.sounds.heroDies.volume = '0.3';
        this.sounds.heroDies.play();
        this.ctx.font ='100px Silom-Bold';
        this.ctx.fillStyle = 'red';
        this.ctx.textBaseline = 'hanging';
        this.ctx.fillText('Game Over', Math.floor((this.canvas.width/2) - (this.ctx.measureText('Game Over').width/2)), Math.floor(this.canvas.height*0.5));
        setTimeout(()=>{
            location.reload();
        },500);
    },
    renderEnemies() {
        this.enemies.displayedEnem.forEach( enemie => {
            if (enemie.alive) {
                if (enemie.type == 'mushroom') {
                    let position =  Math.floor(this.sprites.enemies.countIdleFrames/this.sprites.enemies.staggerFrames) % this.sprites.enemies.mushroomIdleFrames;
                    let frameX = 22.5 * position;
                    let frameY = 0;
                    this.ctx.drawImage(this.sprites.enemies.mushroom.idle, frameX, frameY,
                    22.5, 37, enemie.xpos, enemie.ypos, enemie.width, enemie.height);
                }
                if (enemie.type == 'eye') {
                    let position =  Math.floor(this.sprites.enemies.countIdleFrames/this.sprites.enemies.staggerFrames) % this.sprites.enemies.eyeIdleFrames;
                    let frameX = 42 * position;
                    let frameY = 0;
                    this.ctx.drawImage(this.sprites.enemies.flyingEye.flight, frameX, frameY,
                    42, 32, enemie.xpos, enemie.ypos, enemie.width, enemie.height);
                }
                
            } 
            if (enemie.alive == false){
                if (enemie.type == 'mushroom') {
                    let position = Math.floor(this.sprites.enemies.countDeathFrames/this.sprites.enemies.staggerFrames) % this.sprites.enemies.mushroomIdleFrames;
                    let frameX = 25 * position;
                    let frameY = 0;
                    this.ctx.drawImage(this.sprites.enemies.mushroom.death, frameX, frameY,
                        23, 37, enemie.xpos, enemie.ypos, enemie.width, enemie.height);
                    this.sprites.enemies.countDeathFrames++;
                }
                if (enemie.type == 'eye') {
                    let position = Math.floor(this.sprites.enemies.countEyeDeathFrames/this.sprites.enemies.staggerFrames) % this.sprites.enemies.eyeDeathFrames;
                    let frameX = ((this.sprites.enemies.eyeDeathFrames - 1) * 42) - (42 * position);
                    let frameY = 0;
                    this.ctx.drawImage(this.sprites.enemies.flyingEye.death, frameX, frameY,
                        42, 32, enemie.xpos, enemie.ypos, enemie.width, enemie.height);
                    this.sprites.enemies.countEyeDeathFrames++;
                }
            }
        });
        this.sprites.enemies.countIdleFrames++;
    },
    renderPlayerLives() {
        let xpos = this.canvas.width * 0.05;
        let ypos = this.canvas.height * 0.05;
        this.player.displayedLives.forEach( item =>{
            this.ctx.drawImage(item, xpos, ypos,  Math.floor((this.canvas.height * 0.06)*0.96), Math.floor(this.canvas.height * 0.06));
            xpos += Math.floor(this.canvas.width * 0.05);
        });
        this.enemies.displayedEnem.forEach(enemy => {
            if(enemy.isCollision(this.player.heartBox, enemy) && enemy.alive) {
                this.player.takeDamage();
                enemy.inflictDamage(enemy);
            }
        });
    },
    renderReferenceKey(){
        let fontSize = 16;
        let spriteWidth = 32;
        let xpos = Math.floor(this.canvas.width*0.8);
        let ypos = Math.floor(this.canvas.height*0.05);
        this.sprites.player.spriteKey.forEach( (sprite, index) =>{
            this.ctx.drawImage(sprite, 0, 0, spriteWidth, 32, xpos, ypos, Math.floor(this.canvas.height*0.04), Math.floor(this.canvas.height*0.04));
            if(this.canvas.height <= 500) {
                this.ctx.font = `${fontSize}px Silom-Bold`;
            } else {
                this.ctx.font = '32px Silom-Bold';
            }
            this.ctx.fillStyle = 'white';
            this.ctx.textBaseline = 'hanging';
            this.ctx.fillText(this.sprites.player.playerActions[index], Math.floor(((xpos*100)/80)*0.85), ypos);
            ypos += ypos;
            spriteWidth += 32;
        });
    },
    renderPlayerScore(){
        let fontSize = 64;
        let tempScore = this.player.playerScore;
        if (this.player.playerScore < 10) {
            tempScore = '0' + tempScore;
        }
        if (this.player.playerScore < 100) {
            tempScore = '0' + tempScore;
        }
        this.ctx.font = `${fontSize}px Silom-Bold`;
        this.ctx.fillStyle = 'white';
        this.ctx.textBaseline = 'hanging';
        this.ctx.fillText(tempScore, Math.floor((this.canvas.width/2)-(this.ctx.measureText(tempScore).width/2)), Math.floor(this.canvas.height*0.05));
    },
    renderReferenceBar(){
        this.renderPlayerLives();
        this.renderReferenceKey();
        this.renderPlayerScore();
    },
    bossFight() {
        this.demon.bossFight = true;
        this.sounds.mainTheme.pause();
        this.sounds.bossTheme.volume = '0.1';
        this.sounds.bossTheme.play();
        this.demon.spawn();
        setInterval(()=>{
            if (this.demon.attackDelay) {
                let attackTime = Math.floor(Math.random() * 1000);
                setTimeout(()=>{
                    this.demon.attack();
                }, attackTime);
            }
        },3000);
    },
    start() {
        startBtn.addEventListener('click', ()=>{
            this.preload();
            startScreen.classList.toggle('start-screen_disabled');
            this.sounds.mainTheme.volume = '0.1';
            this.sounds.mainTheme.play();
            this.render();
            setTimeout(()=>{
                this.bossFight();
            },60000);
        });
    }
};
game.start();


