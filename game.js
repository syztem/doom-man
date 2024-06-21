const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let chickens;
let bullets;
let steaks;
let score = 0;
let scoreText;
let comboText;
let healthText;
let backgroundLayers = [];

// New variables for combo and health mechanics
let comboMultiplier = 1;
let comboTimer;
let health = 100;
let comboMeter;

function preload() {
    this.load.image('sky', 'assets/jungle-background.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('chicken', 'assets/chicken.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('steak', 'assets/steak.png');
    this.load.spritesheet('trex', 'assets/trex-spritesheet.png', { frameWidth: 32, frameHeight: 48 });
    
    for (let i = 1; i <= 3; i++) {
        this.load.image(`bg_layer_${i}`, `assets/bg_layer_${i}.png`);
    }
}

function create() {
    for (let i = 1; i <= 3; i++) {
        let bg = this.add.tileSprite(0, 0, 800, 600, `bg_layer_${i}`);
        bg.setOrigin(0, 0);
        bg.setScrollFactor(0);
        backgroundLayers.push(bg);
    }

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'trex');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('trex', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'trex', frame: 4 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('trex', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    chickens = this.physics.add.group({
        key: 'chicken',
        repeat: 5,
        setXY: { x: 12, y: 0, stepX: 140 }
    });

    chickens.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bullets = this.physics.add.group();

    // Add steaks group
    steaks = this.physics.add.group();

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(chickens, platforms);
    this.physics.add.collider(bullets, platforms, bulletHitPlatform, null, this);
    this.physics.add.overlap(bullets, chickens, bulletHitChicken, null, this);
    this.physics.add.collider(steaks, platforms);
    this.physics.add.overlap(player, chickens, playerHitChicken, null, this);
    this.physics.add.overlap(player, steaks, collectSteak, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    comboText = this.add.text(16, 56, 'Combo: x1', { fontSize: '32px', fill: '#000' });
    healthText = this.add.text(16, 96, 'Health: 100', { fontSize: '32px', fill: '#000' });

    // Create combo meter
    comboMeter = this.add.rectangle(400, 30, 0, 20, 0xff0000);
    comboMeter.setOrigin(0, 0.5);

    this.input.keyboard.on('keydown-SPACE', shoot, this);

    // Set up combo timer
    comboTimer = this.time.addEvent({
        delay: 5000,
        callback: resetCombo,
        callbackScope: this,
        loop: true,
        paused: true
    });

    // Spawn steaks periodically
    this.time.addEvent({
        delay: 10000,
        callback: spawnSteak,
        callbackScope: this,
        loop: true
    });
}

function update() {
    backgroundLayers.forEach((bg, index) => {
        bg.tilePositionX += (index + 1) * 0.5;
    });

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        player.flipX = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    // Update combo meter width
    comboMeter.width = (comboMultiplier - 1) * 40;
}

function shoot() {
    let bullet = bullets.create(player.x, player.y, 'bullet');
    bullet.setVelocityX(player.flipX ? -400 : 400);
    bullet.body.setAllowGravity(false);
}

function bulletHitChicken(bullet, chicken) {
    bullet.disableBody(true, true);
    chicken.disableBody(true, true);
    
    increaseCombo();
    score += 10 * comboMultiplier;
    scoreText.setText('Score: ' + score);

    if (chickens.countActive(true) === 0) {
        chickens.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

function bulletHitPlatform(bullet) {
    bullet.disableBody(true, true);
}

function playerHitChicken(player, chicken) {
    chicken.disableBody(true, true);
    health -= 25;
    healthText.setText('Health: ' + health);
    
    if (health <= 0) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;
    }
}

function collectSteak(player, steak) {
    steak.disableBody(true, true);
    health = Math.min(health + 50, 100);
    healthText.setText('Health: ' + health);
}

function increaseCombo() {
    comboMultiplier++;
    comboText.setText('Combo: x' + comboMultiplier);
    comboTimer.paused = false;
    comboTimer.reset({
        delay: 5000,
        callback: resetCombo,
        callbackScope: this,
        loop: false
    });
}

function resetCombo() {
    comboMultiplier = 1;
    comboText.setText('Combo: x1');
    comboTimer.paused = true;
}

function spawnSteak() {
    let x = Phaser.Math.Between(0, 800);
    let steak = steaks.create(x, 0, 'steak');
    steak.setBounce(0.7);
    steak.setCollideWorldBounds(true);
}