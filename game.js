const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/jungle-background.png');
}

function create() {
    try {
        if (this.textures.exists('sky')) {
            this.add.image(400, 300, 'sky');
            console.log('Background loaded successfully');
        } else {
            console.error('Sky texture not found');
            this.add.text(400, 300, 'Asset not found', { fill: '#ffffff' }).setOrigin(0.5);
        }
    } catch (error) {
        console.error('Error in create function:', error);
        this.add.text(400, 300, 'Error occurred', { fill: '#ffffff' }).setOrigin(0.5);
    }
}
