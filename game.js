function create() {
    try {
        for (let i = 1; i <= 3; i++) {
            if (!this.textures.exists(`bg_layer_${i}`)) {
                console.error(`Background layer ${i} not found`);
                continue;
            }
            let bg = this.add.tileSprite(0, 0, 800, 600, `bg_layer_${i}`);
            bg.setOrigin(0, 0);
            bg.setScrollFactor(0);
            backgroundLayers.push(bg);
        }

        if (!this.textures.exists('ground')) {
            console.error('Ground texture not found');
        } else {
            platforms = this.physics.add.staticGroup();
            platforms.create(400, 568, 'ground').setScale(2).refreshBody();
            platforms.create(600, 400, 'ground');
            platforms.create(50, 250, 'ground');
            platforms.create(750, 220, 'ground');
        }

        if (!this.textures.exists('trex')) {
            console.error('T-Rex texture not found');
        } else {
            player = this.physics.add.sprite(100, 450, 'trex');
            player.setBounce(0.2);
            player.setCollideWorldBounds(true);
            
            // ... rest of the player setup code ...
        }

        // ... rest of the create function ...

    } catch (error) {
        console.error('Error in create function:', error);
    }
}
