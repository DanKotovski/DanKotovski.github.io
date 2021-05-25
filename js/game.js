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
        },
        enemies: {
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
        this.parallax.animateParallax();
    },
    parallax: {
        parallaxLayers: null,
        createLayers() {
            this.parallaxLayers = [];
            let speedIncrease = game.gameSpeed;
            for (let layer in game.background.layers) {
                // console.log(this.parallaxLayers);
                let parallaxLayer = new BgLayers(game.background.layers[layer], speedIncrease);
                this.parallaxLayers.push(parallaxLayer);
                speedIncrease += 0.2;
            }
        },
        animateParallax(){
            game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
            game.parallax.parallaxLayers.forEach(layer => {
                layer.update();
                layer.draw();
            });
            requestAnimationFrame(game.parallax.animateParallax);
        }
    }
};
game.preload();
game.render();
console.log(game.background.layers);
console.log(game.sprites);
