// ============================================================
// CANVAS & ASSETS
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const orbImage = new Image();
orbImage.src = 'coin.png';

const hazardImage = new Image();
hazardImage.src = 'asteroid.png';

const spaceshipImage = new Image();
spaceshipImage.src = 'spaceship-updated.png';

// ============================================================
// DRAW / RENDERING
// ============================================================

// DRAW PLAYER IMAGE INSTEAD OF VECTOR SHAPE
    ctx.drawImage(
        spaceshipImage,
        player.x,
        player.y,
        player.width,
        player.height
    );

    // DRAW COIN IMAGES
    collectibles.forEach((item) => {
        ctx.drawImage(
            orbImage,
            item.x - item.size / 2,
            item.y - item.size / 2,
            item.size,
            item.size
        );
    });

    // DRAW ASTEROID IMAGES
    hazards.forEach((hazard) => {
        ctx.drawImage(
            hazardImage,
            hazard.x - hazard.size / 2,
            hazard.y - hazard.size / 2,
            hazard.size,
            hazard.size
        );
    });
}
