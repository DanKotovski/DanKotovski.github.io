'use strict';


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
        this.typeBox = 'hit';
        super(x, y, width, height);
    }
    inflictDamage() {

    }
    isCollision(item1, item2) {
        
    }
}

class HeartBoxes extends Boxes {
    constructor(x, y, width, height) {
        this.typeBox = 'heart';
        super(x, y, width, height);
    }
}